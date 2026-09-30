import { ai, MODEL_NAME } from "./gemini";
import {
  toolDeclarations,
  toolExecutors,
} from "../tools";
import { AGENT_SYSTEM_PROMPT } from "./prompts";
import { buildSourceAwareContext } from "./sourceAwareAnswer";

const MAX_AGENT_STEPS = 5;

export async function generateAgentResponse(messages) {
  const contents = messages.map((message) => ({
    role:
      message.role === "assistant"
        ? "model"
        : "user",

    parts: [
      {
        text: message.content,
      },
    ],
  }));

  for (
    let step = 0;
    step < MAX_AGENT_STEPS;
    step++
  ) {
    console.log(
      `[Agent] Starting step ${step + 1}`
    );

    const response =
      await ai.models.generateContent({
        model: MODEL_NAME,

        contents,

        config: {
          systemInstruction:
            AGENT_SYSTEM_PROMPT,

          tools: [
            {
              functionDeclarations:
                toolDeclarations,
            },
          ],
        },
      });

    const functionCalls =
      response.functionCalls;

    console.log(
      "[Agent] Function calls:",
      JSON.stringify(
        functionCalls,
        null,
        2
      )
    );

    if (
      !functionCalls ||
      functionCalls.length === 0
    ) {
      console.log(
        "[Agent] Final answer generated."
      );

      return response.text;
    }

    contents.push(
      response.candidates[0].content
    );

    const functionResponseParts = [];

    for (const functionCall of functionCalls) {
      const toolName =
        functionCall.name;

      const toolArguments =
        functionCall.args ?? {};

      const toolExecutor =
        toolExecutors[toolName];

      console.log(
        `[Agent] Executing tool: ${toolName}`
      );

      console.log(
        "[Agent] Tool arguments:",
        toolArguments
      );

      if (!toolExecutor) {
        functionResponseParts.push({
          functionResponse: {
            name: toolName,

            response: {
              error: `Unknown tool: ${toolName}`,
            },

            id: functionCall.id,
          },
        });

        continue;
      }

      try {
        const result =
          await toolExecutor(
            toolArguments
          );

        let finalResult = result;

        /*
         * Level 4.12
         *
         * When web search is used,
         * convert the structured search
         * result into source-aware context
         * before sending it back to Gemini.
         */
        if (
          toolName ===
            "search_web_cars" &&
          result?.success &&
          result?.data
        ) {
          const sourceAwareContext =
            buildSourceAwareContext(
              result.data
            );

          finalResult = {
            ...result,

            data: {
              ...result.data,

              sourceAwareContext,
            },
          };
        }

        functionResponseParts.push({
          functionResponse: {
            name: toolName,

            response: {
              result: finalResult,
            },

            id: functionCall.id,
          },
        });

        console.log(
          `[Agent] Tool "${toolName}" completed successfully.`
        );
      } catch (error) {
        console.error(
          `[Agent] Tool "${toolName}" failed:`,
          error
        );

        functionResponseParts.push({
          functionResponse: {
            name: toolName,

            response: {
              error: `Tool "${toolName}" failed to execute.`,
            },

            id: functionCall.id,
          },
        });
      }
    }

    contents.push({
      role: "user",

      parts:
        functionResponseParts,
    });

    console.log(
      `[Agent] Step ${step + 1} completed.`
    );
  }

  throw new Error(
    "Agent exceeded the maximum number of tool execution steps."
  );
}