import { ai, MODEL_NAME } from "./gemini";
import {
  groq,
  MODEL_NAME as GROQ_MODEL_NAME,
} from "./Groq";
import {
  toolDeclarations,
  toolExecutors,
} from "../tools";
import { AGENT_SYSTEM_PROMPT } from "./prompts";
import { buildSourceAwareContext } from "./sourceAwareAnswer";
import { fuseResults } from "./resultFusion";

const MAX_AGENT_STEPS = 5;

// ----------------------------------------
// GROQ FALLBACK HELPERS
// ----------------------------------------

// Gemini schemas may use uppercase types ("OBJECT", "STRING").
// Groq expects standard JSON Schema lowercase types.
function toGroqSchema(schema) {
  if (Array.isArray(schema)) {
    return schema.map(toGroqSchema);
  }

  if (schema && typeof schema === "object") {
    const converted = {};

    for (const [key, value] of Object.entries(schema)) {
      if (key === "type" && typeof value === "string") {
        converted[key] = value.toLowerCase();
      } else {
        converted[key] = toGroqSchema(value);
      }
    }

    return converted;
  }

  return schema;
}

const groqToolDeclarations = toolDeclarations.map(
  (declaration) => ({
    type: "function",
    function: {
      name: declaration.name,
      description: declaration.description,
      parameters: toGroqSchema(
        declaration.parameters ?? {
          type: "object",
          properties: {},
        }
      ),
    },
  })
);

// Converts the Gemini-style history into Groq chat messages.
function contentsToGroqMessages(contents) {
  const messages = [
    {
      role: "system",
      content: AGENT_SYSTEM_PROMPT,
    },
  ];

  let pendingIds = [];

  contents.forEach((content, messageIndex) => {
    const parts = content.parts || [];

    const text = parts
      .filter((part) => part.text && !part.thought)
      .map((part) => part.text)
      .join("\n");

    const calls = parts.filter((part) => part.functionCall);
    const responses = parts.filter(
      (part) => part.functionResponse
    );

    if (content.role === "model") {
      if (calls.length > 0) {
        pendingIds = calls.map(
          (part, index) =>
            part.functionCall.id ||
            `call_${messageIndex}_${index}`
        );

        messages.push({
          role: "assistant",
          content: text || null,
          tool_calls: calls.map((part, index) => ({
            id: pendingIds[index],
            type: "function",
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(
                part.functionCall.args ?? {}
              ),
            },
          })),
        });
      } else {
        messages.push({
          role: "assistant",
          content: text,
        });
      }

      return;
    }

    if (responses.length > 0) {
      responses.forEach((part, index) => {
        messages.push({
          role: "tool",
          tool_call_id:
            part.functionResponse.id ||
            pendingIds[index],
          content: JSON.stringify(
            part.functionResponse.response?.result ??
            part.functionResponse.response ??
            {}
          ),
        });
      });

      return;
    }

    messages.push({
      role: "user",
      content: text,
    });
  });

  return messages;
}

function parseToolArguments(rawArguments) {
  try {
    return JSON.parse(rawArguments || "{}");
  } catch {
    return {};
  }
}

// ----------------------------------------
// MODEL CALLS (SAME RETURN SHAPE)
// ----------------------------------------

async function callGemini(contents) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents,
    config: {
      systemInstruction: AGENT_SYSTEM_PROMPT,
      tools: [
        {
          functionDeclarations: toolDeclarations,
        },
      ],
    },
  });

  return {
    text: response.text,
    functionCalls: response.functionCalls,
    modelContent: response.candidates?.[0]?.content,
  };
}

async function callGroq(contents) {
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL_NAME,
    messages: contentsToGroqMessages(contents),
    tools: groqToolDeclarations,
    tool_choice: "auto",
    reasoning_effort: "low",
    temperature: 1,
    max_completion_tokens: 4096,
    stream: false,
  });

  const message = response.choices?.[0]?.message;

  const functionCalls = (message?.tool_calls || []).map(
    (toolCall) => ({
      id: toolCall.id,
      name: toolCall.function.name,
      args: parseToolArguments(toolCall.function.arguments),
    })
  );

  // Keep the shared history in Gemini format.
  const parts = [];

  if (message?.content) {
    parts.push({ text: message.content });
  }

  for (const functionCall of functionCalls) {
    parts.push({ functionCall });
  }

  return {
    text: message?.content || "",
    functionCalls,
    modelContent: {
      role: "model",
      parts,
    },
  };
}


function mergeWebResults(current, incoming) {
  const incomingSources = Array.isArray(incoming?.sources)
    ? incoming.sources
    : [];

  if (!current) {
    return {
      ...incoming,
      sources: Array.from(
        new Map(
          incomingSources
            .filter((source) => source?.url)
            .map((source) => [source.url, source])
        ).values()
      ),
      searchedQueries: incoming?.query
        ? [incoming.query]
        : [],
    };
  }

  const allSources = [
    ...(current.sources || []),
    ...incomingSources,
  ];

  const uniqueSources = Array.from(
    new Map(
      allSources
        .filter((source) => source?.url)
        .map((source) => [source.url, source])
    ).values()
  );

  const answers = [
    current.answer,
    incoming.answer,
  ].filter(
    (answer) =>
      typeof answer === "string" &&
      answer.trim().length > 0
  );

  const previousConflicts = current.conflicts || {};
  const nextConflicts = incoming.conflicts || {};

  const conflictTypes = [
    ...(previousConflicts.conflictTypes || []),
    ...(nextConflicts.conflictTypes || []),
  ];

  const previousFreshness = current.freshness || {};
  const nextFreshness = incoming.freshness || {};

  const searchedQueries = [
    ...(current.searchedQueries || []),
    ...(incoming.query ? [incoming.query] : []),
  ];

  const uniqueQueries = [...new Set(searchedQueries)];
  const uniqueConflictTypes = [...new Set(conflictTypes)];

  const years = [
    previousFreshness.detectedYear,
    nextFreshness.detectedYear,
  ].filter((year) => typeof year === "number");

  const previousPrice = previousConflicts.price || {};
  const nextPrice = nextConflicts.price || {};

  const priceValues = [
    ...(previousPrice.values || []),
    ...(nextPrice.values || []),
  ];

  return {
    success:
      current.success === true ||
      incoming.success === true,

    answer: answers.join(
      "\n\n--- Additional model research ---\n\n"
    ),

    sources: uniqueSources,
    searchedQueries: uniqueQueries,

    conflicts: {
      hasConflict:
        previousConflicts.hasConflict === true ||
        nextConflicts.hasConflict === true,

      conflictTypes: uniqueConflictTypes,

      price: {
        hasConflict:
          previousPrice.hasConflict === true ||
          nextPrice.hasConflict === true,

        values: Array.from(
          new Map(
            priceValues.map((item) => [
              `${item.value}:${item.raw}`,
              item,
            ])
          ).values()
        ),
      },
    },

    freshness: {
      requiresFreshData:
        previousFreshness.requiresFreshData === true ||
        nextFreshness.requiresFreshData === true,

      intent:
        nextFreshness.intent ||
        previousFreshness.intent ||
        "general",

      detectedYear:
        years.length > 0 ? Math.max(...years) : null,

      freshnessWarning: [
        previousFreshness.freshnessWarning,
        nextFreshness.freshnessWarning,
      ].filter(Boolean).join(" ") || null,
    },

    metadata: {
      sourceCount: uniqueSources.length,

      hasOfficialSource: uniqueSources.some(
        (source) => source.tier === 1
      ),

      hasEstablishedSource: uniqueSources.some(
        (source) => source.tier === 2
      ),

      hasConflict:
        previousConflicts.hasConflict === true ||
        nextConflicts.hasConflict === true,
    },

    sourceAwareContext: [
      current.sourceAwareContext,
      incoming.sourceAwareContext,
    ].filter(Boolean).join("\n\n"),
  };
}



export async function generateAgentResponse(messages) {
  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  // Preserve the latest results if tools run in different steps.
  const latestToolResults = {
    local: null,
    web: null,
  };

  // Once Gemini fails, stay on Groq for the rest of this request.
  let useFallback = false;

  for (let step = 0; step < MAX_AGENT_STEPS; step++) {
    console.log(`[Agent] Starting step ${step + 1}`);

    let modelTurn;

    if (!useFallback) {
      try {
        modelTurn = await callGemini(contents);
      } catch (error) {
        console.error(
          "[Agent] Gemini failed, switching to Groq fallback:",
          error?.status || "",
          error?.message || error
        );

        useFallback = true;
      }
    }

    if (useFallback) {
      modelTurn = await callGroq(contents);
    }

    console.log(
      `[Agent] Provider: ${useFallback ? "groq" : "gemini"}`
    );

    const functionCalls = modelTurn.functionCalls;

    console.log(
      "[Agent] Function calls:",
      JSON.stringify(functionCalls, null, 2)
    );

    if (!functionCalls || functionCalls.length === 0) {
      console.log("[Agent] Final answer generated.");
      return modelTurn.text;
    }

    contents.push(modelTurn.modelContent);

    const executedTools = [];

    // Execute the tools requested by the model.
    for (const functionCall of functionCalls) {
      const toolName = functionCall.name;
      const toolArguments = functionCall.args ?? {};
      const toolExecutor = toolExecutors[toolName];

      console.log(`[Agent] Executing tool: ${toolName}`);
      console.log("[Agent] Tool arguments:", toolArguments);

      if (!toolExecutor) {
        executedTools.push({
          functionCall,
          toolName,
          result: {
            success: false,
            error: `Unknown tool: ${toolName}`,
          },
        });

        continue;
      }

      try {
        let result = await toolExecutor(toolArguments);

        // Keep the existing source-aware processing for web results.
        if (
          toolName === "search_web_cars" &&
          result?.success &&
          result?.data
        ) {
          const sourceAwareContext =
            buildSourceAwareContext(result.data);

          result = {
            ...result,
            data: {
              ...result.data,
              sourceAwareContext,
            },
          };


          latestToolResults.web = mergeWebResults(
            latestToolResults.web,
            {
              ...result.data,
              query: toolArguments.query,
            }
          );

        }

        if (toolName === "search_cars") {
          latestToolResults.local = result;
        }

        executedTools.push({
          functionCall,
          toolName,
          result,
        });

        console.log(
          `[Agent] Tool "${toolName}" completed successfully.`
        );
      } catch (error) {
        console.error(
          `[Agent] Tool "${toolName}" failed:`,
          error
        );

        executedTools.push({
          functionCall,
          toolName,
          result: {
            success: false,
            error: `Tool "${toolName}" failed to execute.`,
          },
        });
      }
    }

    // Fuse results only when both tools have supplied results.
    const hasLocalResult =
      latestToolResults.local !== null;

    const hasWebResult =
      latestToolResults.web !== null;

    let hybridEvidence = null;

    if (hasLocalResult && hasWebResult) {
      hybridEvidence = fuseResults({
        localResult: latestToolResults.local,
        webResult: latestToolResults.web,
      });

      console.log("[Agent] Hybrid result fusion completed.");
      console.log("[Agent] Fusion summary:", hybridEvidence.summary);
    }

    const functionResponseParts = executedTools.map(
      ({ functionCall, toolName, result }) => {
        let finalResult = result;

        // Attach combined evidence to the current tool responses.
        // The original local and web results remain separate.
        if (
          hybridEvidence &&
          (
            toolName === "search_cars" ||
            toolName === "search_web_cars"
          )
        ) {
          finalResult = {
            ...result,
            hybridEvidence,
          };
        }

        return {
          functionResponse: {
            name: toolName,
            response: {
              result: finalResult,
            },
            id: functionCall.id,
          },
        };
      }
    );

    contents.push({
      role: "user",
      parts: functionResponseParts,
    });

    console.log(`[Agent] Step ${step + 1} completed.`);
  }

  throw new Error(
    "Agent exceeded the maximum number of tool execution steps."
  );
}