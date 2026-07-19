"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>
          Something went wrong
        </h1>

        <p style={{ color: "#6b7280", maxWidth: "28rem" }}>
          A critical error occurred. Please try again.
        </p>

        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: "9999px",
            backgroundColor: "#000",
            color: "#fff",
            padding: "1rem 2rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
