"use client";

// Replaces the root layout when it fails, so it carries its own document and minimal, self-contained
// styling (no shared CSS or webfonts are guaranteed here). Same palette and voice as the rest.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f5f1e8", color: "#171512", fontFamily: "Georgia, 'Times New Roman', serif" }}>
        <main style={{ minHeight: "100svh", display: "grid", alignContent: "center", padding: "0 clamp(1.25rem, 4vw, 3.5rem)" }}>
          <p style={{ font: "500 0.75rem/1.4 system-ui, sans-serif", letterSpacing: "0.16em", textTransform: "uppercase", color: "#7a3324", margin: 0 }}>Something did not open</p>
          <h1 style={{ fontWeight: 300, fontSize: "clamp(2.6rem, 8vw, 6rem)", lineHeight: 0.98, margin: "1.5rem 0 0", maxWidth: "14ch" }}>
            The studio could not <em>load.</em>
          </h1>
          <p style={{ font: "1rem/1.65 system-ui, sans-serif", color: "#2d2a26", marginTop: "2rem" }}>Nothing has been lost. This preview keeps no client data.</p>
          <div style={{ marginTop: "2rem" }}>
            <button
              onClick={() => retry()}
              style={{ minHeight: "2.75rem", padding: "0 1.25rem", border: "1px solid #171512", background: "#171512", color: "#f5f1e8", font: "500 0.75rem system-ui, sans-serif", letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer", borderRadius: 2 }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
