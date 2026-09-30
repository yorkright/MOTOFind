# MotoFind  — a real AI agent on Gemini + Next.js

This is a working scaffold, not a toy demo: server-only API keys, real function
calling (search + calculator), streaming responses, rate limiting, input
validation, and a landing page. Read this once before you start changing things.

## 1. Architecture, in one paragraph

The browser never talks to Gemini directly — it only talks to
`app/api/agent/route.js`, a Next.js Route Handler that runs on the server.
That route validates the request, rate-limits the caller, then hands off to
`lib/agent/agentLoop.js`, which repeatedly calls Gemini with function-calling
enabled: if Gemini asks for a tool (`web_search`, `calculator`), the loop runs
it server-side and feeds the result back, up to a hard cap of 4 rounds. Every
step — text chunks, tool calls, tool results — is streamed to the browser as
Server-Sent Events, so the UI can show its work instead of a blank spinner.

```
app/
  page.jsx                 → landing page (marketing)
  agent/page.jsx            → the actual chat UI
  api/agent/route.js        → POST endpoint: validate → rate-limit → stream
  layout.jsx, globals.css
components/
  landing/                  → Navbar, Hero, TraceConsole, HowItWorks, ...
lib/
  gemini/client.js          → server-only Gemini client (throws if key missing)
  agent/
    agentLoop.js             → the tool-calling loop + SSE event emission
    systemPrompt.js
    tools.js                 → registry: declarations Gemini sees + executors that run
    tools/webSearch.js        → real Tavily search, not a stub
    tools/calculator.js       → safe arithmetic parser (no eval)
  rateLimit.js               → Upstash Redis in prod, in-memory fallback in dev
```

## 2. Get it running locally

```bash
npm install
cp .env.local.example .env.local
# fill in GEMINI_API_KEY (required) and TAVILY_API_KEY (optional, for web search)
npm run dev
```

- Get a Gemini key at https://aistudio.google.com/apikey
- Get a free Tavily key at https://tavily.com — without it, the agent still
  works, `web_search` just returns a clean "not configured" error the model
  can talk around, instead of your app crashing.

Open `/` for the landing page, `/agent` for the working chat.

## 3. Why it's built this way (the production decisions)

**API key never reaches the client.** `lib/gemini/client.js` reads
`process.env.GEMINI_API_KEY` — no `NEXT_PUBLIC_` prefix, so Next.js never
bundles it into client JS. All Gemini calls happen inside `app/api/agent/route.js`,
which only runs on the server. Never move the Gemini client into a
`"use client"` component.

**No `eval()` anywhere.** The calculator tool is a small hand-written parser.
The moment you let an LLM-controlled string reach `eval`/`new Function`, a
cleverly-worded prompt can run arbitrary code on your server. This applies to
every tool you add later, too — validate and constrain what the model can
actually do.

**Tool loop has a hard cap.** `MAX_TOOL_ROUNDS = 4` in `agentLoop.js`. Without
this, a model that keeps deciding "I should search again" can loop
indefinitely and burn your Gemini quota on one user's request.

**Rate limiting from day one.** `lib/rateLimit.js` defaults to an in-memory
limiter (fine for `npm run dev`, NOT fine in production — serverless
functions are stateless and multi-instance, so memory doesn't persist or
share across requests). Set `UPSTASH_REDIS_REST_URL` /
`UPSTASH_REDIS_REST_TOKEN` (free tier at https://upstash.com) before you
deploy, or every user effectively gets their own limit.

**Input validation on the route, not just the UI.** `route.js` checks message
shape and length before touching Gemini. Anyone can `curl` your API directly —
never trust that requests came from your own frontend.

**Errors are structured, not thrown into the void.** Tool failures return
`{ error: "..." }` instead of throwing, so the model can tell the user
"search failed" instead of the whole request dying. Gemini errors (rate
limit, bad key, safety block) are mapped to plain-English messages in
`describeGeminiError`.

## 4. Extending it

**Add a tool:** write `lib/agent/tools/yourTool.js` exporting the executor and
a `functionDeclarations`-shaped schema, then register both in `lib/agent/tools.js`.
That's it — the loop and the route don't change.

**Add persistence (chat history in MongoDB, per your Finance-Coach setup):**
save `messages` after each turn in `app/api/agent/route.js`, and load prior
history before building `contents`. Keep `MAX_HISTORY_MESSAGES` in
`agentLoop.js` — summarize older turns instead of sending your whole history
on every request as the conversation grows, or your token cost grows
unbounded with every message.

**Add auth (Clerk, per your other project):** wrap `/agent` in your normal
Clerk middleware, and swap the IP-based rate-limit key in `route.js` for the
real `userId` from `auth()` — IP alone is easy to share (offices, mobile
carriers) or spoof.

## 5. Deploying to production (Vercel)

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Set environment variables in the Vercel project settings — **not** in a
   committed `.env` file: `GEMINI_API_KEY`, `TAVILY_API_KEY`,
   `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
4. Deploy. The agent route is already `runtime = "nodejs"` (function calling +
   streaming need Node, not the Edge runtime), so no config changes needed there.
5. Before real traffic: confirm your Gemini project has a billing plan set
   (the free tier's rate limits are low), and check the Upstash free tier
   quota against your expected traffic.

## 6. What this scaffold intentionally leaves out

- Persistent chat history (bring your own DB — you already have a MongoDB
  pattern from Finance-Coach, reuse it).
- Auth (bring Clerk in, same as Finance-Coach).
- Streaming cancellation on the client beyond closing the tab (add an abort
  button that calls `abortRef.current.abort()` from `app/agent/page.jsx` if
  you want a manual "stop generating").
- Observability — add logging (even `console.log` shipped to Vercel's log
  drain is a start) around tool calls and errors before you have real users,
  so failures aren't invisible.
