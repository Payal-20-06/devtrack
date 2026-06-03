"use client";

import { signIn } from "next-auth/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const A = "#818cf8";
const ERR = "#f87171";
const MONO = "var(--font-jetbrains, ui-monospace, monospace)";
const DISP = "var(--font-syne, system-ui, sans-serif)";

/** Maps NextAuth error codes → user-facing messages. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  github:
    "GitHub sign-in failed. This is usually caused by incorrect OAuth credentials or a mismatched callback URL. Check your GitHub OAuth App settings and try again.",
  OAuthCallback:
    "The OAuth callback could not be completed. Please try signing in again.",
  OAuthSignin:
    "Could not start the GitHub sign-in flow. Please try again.",
  Configuration:
    "There is a server configuration error. Please contact the site administrator.",
  AccessDenied:
    "Access was denied. You may have cancelled the GitHub authorization.",
  Verification:
    "The sign-in link has expired or has already been used.",
  Default:
    "An unexpected authentication error occurred. Please try again.",
};

function getErrorMessage(error: string): string {
  return AUTH_ERROR_MESSAGES[error] ?? AUTH_ERROR_MESSAGES.Default;
}

function AuthErrorBanner({ error }: { error: string }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        width: "100%",
        marginBottom: 24,
        padding: "12px 16px",
        borderRadius: 8,
        background: "rgba(248,113,113,0.08)",
        border: `1px solid rgba(248,113,113,0.25)`,
        textAlign: "left",
      }}
    >
      <p
        style={{
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 700,
          color: ERR,
          margin: "0 0 4px",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        ⚠ Sign-in failed
      </p>
      <p
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: "#e87a7a",
          margin: 0,
          lineHeight: 1.65,
        }}
      >
        {getErrorMessage(error)}
      </p>
    </div>
  );
}

function MouseSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate3d(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%), 0)`;
      }
    };
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed", pointerEvents: "none", zIndex: 0,
        left: 0, top: 0,
        width: 600, height: 600,
        background:
          "radial-gradient(circle, rgba(129,140,248,0.06) 0%, transparent 70%)",
        transform: "translate3d(-50%, -50%, 0)",
        willChange: "transform",
      }}
    />
  );
}

/**
 * Inner component that reads search params — must live inside a Suspense
 * boundary because useSearchParams() opts the subtree out of static rendering.
 */
function SignInContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLocalhost(
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      );
    }
  }, []);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    signIn("credentials", {
      username,
      token,
      callbackUrl: "/dashboard",
    });
  };

  // Clear the ?error= param from the URL immediately after reading it so
  // that refreshing the page or navigating back doesn't show a stale error
  // from a previous sign-in attempt.
  useEffect(() => {
    if (error && typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[var(--shadow-medium)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[var(--accent)]/20 blur-2xl" />

      <div
        style={{
          width: "100%",
          maxWidth: 520,
          border: "1px solid #1a1a1a",
          borderRadius: 12,
          padding: "clamp(28px,5vw,48px) clamp(24px,5vw,40px)",
          background: "#0e0e0e",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >

         {/* BACK TO HOME */}
      <div
        style={{
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems:"center",
    marginBottom: 20,
  }}
      >
        <Link
          href="/"
          style={{
            fontFamily: MONO,
    color: "#e8e8e8",
    textDecoration: "none",
  fontSize:12 }}
        >
           ← Back to home
        </Link>
      </div>


        
        <div style={{ marginBottom: 36 }}>
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 13,
              color: "#e8e8e8",
              letterSpacing: "-0.02em",
            }}
          >
            <span style={{ color: A }}>▲</span> DEVTRACK
          </span>
        </div>

        <h1
          style={{
            fontFamily: DISP,
            fontWeight: 800,
            fontSize: "clamp(34px,6vw,35px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.25,
            color: "#e8e8e8",
            margin: "0 0 16px",
          }}
        >
          WELCOME<br />
          <span style={{ color: A }}>BACK.</span>
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "#9ca3af",
            lineHeight: 1.65,
            margin: "0 0 36px",
            fontFamily: MONO,
          }}
        >
          Track streaks, PR velocity &amp; coding growth.
        </p>

        {error && <AuthErrorBanner error={error} />}

        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          aria-label="Sign in with GitHub"
          className="primary-button relative w-full inline-flex items-center justify-center gap-3 rounded-xl py-3 font-semibold"
        >
          Sign in with GitHub
        </button>

        {isLocalhost && (
          <div style={{ width: "100%", marginTop: 24, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ height: 1, flex: 1, backgroundColor: "var(--border)" }} />
              <span style={{ fontFamily: MONO, fontSize: 11, color: "#9ca3af" }}>OR BYPASS</span>
              <div style={{ height: 1, flex: 1, backgroundColor: "var(--border)" }} />
            </div>

            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={{ fontFamily: MONO }}>
                  GitHub Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. bhavyanjain3004"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2 text-sm bg-[var(--control)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] text-[#e8e8e8]"
                  style={{ fontFamily: MONO }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={{ fontFamily: MONO }}>
                  Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  placeholder="Optional (to sync real data)"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-[var(--control)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--accent)] text-[#e8e8e8]"
                  style={{ fontFamily: MONO }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 text-sm font-semibold rounded-xl text-center bg-[var(--accent)] hover:opacity-90 transition-opacity text-white"
                style={{ fontFamily: MONO }}
              >
                Sign In with Mock Credentials
              </button>
            </form>
          </div>
        )}

        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: "#9ca3af",
            letterSpacing: "0.06em",
            lineHeight: 1.8,
          }}
        >
          MIT License · Self-hostable · Free forever
        </div>
      </div>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
