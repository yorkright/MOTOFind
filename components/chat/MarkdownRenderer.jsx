"use client";

import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders Gemini's markdown output (headings, bold, lists, code, tables,
 * links, callouts) with styling that matches the white-text / accent-color
 * chat theme. Tuned for car content: spec tables, feature lists, step-by-step
 * buying guides, and tip / warning / verdict callouts.
 * Kept separate from ChatMessage so any future surface that shows AI text
 * (e.g. a recommendation summary card) can reuse it as-is.
 */

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Flattens React children into plain text (used for callout detection + copy).
function getText(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getText).join("");
  if (node.props && node.props.children !== undefined)
    return getText(node.props.children);
  return "";
}

// A blockquote becomes a colored callout when it starts with one of these
// markers, e.g.  > 💡 **Tip:** ...   or   > **Warning:** ...
// Full class strings on purpose so Tailwind's compiler can see them.
const CALLOUTS = [
  {
    test: /^\s*(💡|tip\b|pro tip\b)/i,
    box: "border-emerald-400/50 bg-emerald-400/10",
  },
  {
    test: /^\s*(⚠️?|warning\b|caution\b|heads up\b)/i,
    box: "border-amber-400/50 bg-amber-400/10",
  },
  {
    test: /^\s*(ℹ️?|note\b|info\b)/i,
    box: "border-sky-400/50 bg-sky-400/10",
  },
  {
    test: /^\s*(✅|🏆|verdict\b|our pick\b|best pick\b|recommendation\b)/i,
    box: "border-accent/60 bg-accent/10",
  },
];

/* ------------------------------------------------------------------ */
/* Code block with language label + copy button                        */
/* ------------------------------------------------------------------ */

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);

  const codeEl = Array.isArray(children) ? children[0] : children;
  const lang = /language-([\w-]+)/.exec(
    (codeEl && codeEl.props && codeEl.props.className) || "",
  )?.[1];
  const text = getText(
    codeEl && codeEl.props ? codeEl.props.children : "",
  ).replace(/\n$/, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (insecure context / permissions) — fail silently.
    }
  };

  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black last:mb-0">
      <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-1.5">
        <span className="font-mono text-xs text-white/50">
          {lang || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs font-medium text-white/50 transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3">{children}</pre>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Markdown element → styled component map                             */
/* Defined at module level (not inside the component) so React keeps   */
/* the same component identities between renders. Otherwise every      */
/* streamed token remounts the whole tree, which is slow and breaks    */
/* text selection while the AI is still typing.                        */
/* ------------------------------------------------------------------ */

const REMARK_PLUGINS = [remarkGfm];

const MARKDOWN_COMPONENTS = {
  /* ---------- Headings ---------- */
  h1: ({ children }) => (
    <h1 className="mb-3 mt-5 border-b border-white/10 pb-2 text-lg font-bold text-white first:mt-0 sm:text-xl">
      {children}
    </h1>
  ),
  // Section titles ("Key Features", "Specifications") get an accent bar
  h2: ({ children }) => (
    <h2 className="mb-2.5 mt-5 flex items-center gap-2.5 text-base font-semibold text-white first:mt-0 before:h-4 before:w-1 before:flex-shrink-0 before:rounded-full before:bg-accent sm:text-lg">
      {children}
    </h2>
  ),
  // Sub-sections / individual car names
  h3: ({ children }) => (
    <h3 className="mb-1.5 mt-4 border-l-2 border-accent/60 pl-2.5 text-sm font-semibold text-white first:mt-0 sm:text-base">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1 mt-3 text-sm font-semibold text-white/80 first:mt-0">
      {children}
    </h4>
  ),

  /* ---------- Text ---------- */
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-accent">{children}</strong>
  ),
  em: ({ children }) => <em className="text-white/90">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-2 hover:brightness-125"
    >
      {children}
    </a>
  ),
  hr: () => (
    <hr className="my-5 h-px border-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
  ),
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className="my-3 max-h-72 w-full rounded-xl border border-white/10 object-cover"
    />
  ),

  /* ---------- Lists ---------- */
  // Bullets (features, pros/cons) — accent dot, aligned to the first line.
  // Task-list items ("- [ ] Check service history") drop the dot and show a checkbox.
  ul: ({ children }) => (
    <ul className="mb-3 ml-1 list-none space-y-2 last:mb-0 [&>li]:flex [&>li]:gap-2.5 [&>li]:pl-1 [&>li]:before:mt-[0.6em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:flex-shrink-0 [&>li]:before:rounded-full [&>li]:before:bg-accent [&>.task-list-item]:before:hidden">
      {children}
    </ul>
  ),
  // Numbered steps (buying guides, how-tos) — numbered badge via CSS counter.
  ol: ({ children }) => (
    <ol className="mb-3 ml-1 list-none space-y-2.5 last:mb-0 [counter-reset:item] [&>li]:flex [&>li]:gap-2.5 [&>li]:[counter-increment:item] [&>li]:before:mt-px [&>li]:before:flex [&>li]:before:h-5 [&>li]:before:w-5 [&>li]:before:flex-shrink-0 [&>li]:before:items-center [&>li]:before:justify-center [&>li]:before:rounded-full [&>li]:before:bg-accent/15 [&>li]:before:text-[11px] [&>li]:before:font-semibold [&>li]:before:leading-none [&>li]:before:text-accent [&>li]:before:content-[counter(item)]">
      {children}
    </ol>
  ),
  li: ({ children, className }) => (
    <li className={className}>
      <div className="min-w-0 flex-1 [&>ol]:mt-2 [&>p:last-child]:mb-0 [&>p]:mb-1.5 [&>ul]:mt-2">
        {children}
      </div>
    </li>
  ),
  input: ({ type, checked }) =>
    type === "checkbox" ? (
      <span
        role="checkbox"
        aria-checked={!!checked}
        className={`mr-2 inline-flex h-4 w-4 translate-y-[3px] items-center justify-center rounded border text-[10px] leading-none ${
          checked ? "border-accent bg-accent text-black" : "border-white/30"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
    ) : null,

  /* ---------- Blockquote → callout (tip / warning / note / verdict) ---------- */
  blockquote: ({ children }) => {
    const text = getText(children);
    const callout = CALLOUTS.find((c) => c.test.test(text));
    return (
      <blockquote
        className={`mb-3 rounded-r-xl border-l-4 px-4 py-3 last:mb-0 [&>p:last-child]:mb-0 [&>p]:mb-1.5 ${
          callout
            ? `${callout.box} text-white/90`
            : "border-accent/60 bg-white/5 text-white/70"
        }`}
      >
        {children}
      </blockquote>
    );
  },

  /* ---------- Code ---------- */
  // Works with both older and newer react-markdown: block vs inline is
  // detected from the language class / newline instead of the `inline` prop.
  code: ({ className, children }) => {
    const isBlock =
      /language-/.test(className || "") || getText(children).includes("\n");
    return isBlock ? (
      <code className="block font-mono text-[0.85em] leading-relaxed text-white/90">
        {children}
      </code>
    ) : (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,

  /* ---------- Tables (spec sheets, trim comparisons) ---------- */
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03] last:mb-0">
      <table className="w-full min-w-[420px] border-collapse text-left text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-white/20 bg-white/5">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  // First column = the spec / feature name, so it reads as a label
  tr: ({ children }) => (
    <tr className="[&>td:first-child]:font-medium [&>td:first-child]:text-white">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-accent">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-white/10 px-3 py-2.5 align-top text-white/85">
      {children}
    </td>
  ),
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function MarkdownRenderer({ content }) {
  return (
    <div className="markdown-body break-words text-sm leading-relaxed lg:text-white sm:text-base">
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        components={MARKDOWN_COMPONENTS}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownRenderer);
