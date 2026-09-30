export default function Footer() {
  return (
    <footer className="border-t border-border/60 px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-sm text-muted sm:flex-row sm:text-left">
        <span>© {new Date().getFullYear()} Arclight. Built on Gemini.</span>
        <div className="flex gap-6">
          <a href="#how-it-works" className="transition hover:text-ink">
            How it works
          </a>
          <a href="#capabilities" className="transition hover:text-ink">
            Capabilities
          </a>
        </div>
      </div>
    </footer>
  );
}
