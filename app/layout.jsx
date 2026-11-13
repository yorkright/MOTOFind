import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "Motofind — an AI agent that actually does the work",
  description:
    "Motofind plans, searches, and calculates in the open — every step visible, every answer traceable. Built on Gemini.",
};

// viewportFit: "cover" lets pages use env(safe-area-inset-*) to pad around
// notches/home indicators (used in app/agent/page.jsx). userScalable stays
// enabled — locking zoom out is an accessibility anti-pattern.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0F19",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-body">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
