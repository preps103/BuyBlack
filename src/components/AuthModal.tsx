"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";

const GOODOS_AUTH_ORIGIN = "";
const GOODOS_PUBLIC_ORIGIN = "https://base.goodos.app";

export default function AuthModal({
  open,
  onClose,
  onAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mfaUrl, setMfaUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMfaUrl("");
    try {
      const response = await fetch(`${GOODOS_AUTH_ORIGIN}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || "Unable to sign in.");
      }
      if (payload.mfa?.required) {
        setError("Password verified. Complete GoodOS verification to continue.");
        setMfaUrl(
          payload.mfa.enrollmentUrl || `${GOODOS_PUBLIC_ORIGIN}/mfa-enroll`,
        );
        return;
      }
      setPassword("");
      await onAuthenticated();
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to sign in.",
      );
    } finally {
      setLoading(false);
    }
  };

  const beginGoodOSLogin = () => {
    window.location.assign(
      `${GOODOS_PUBLIC_ORIGIN}/auth/ui?redirect=${encodeURIComponent(window.location.origin)}`,
    );
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-bazaar-dark/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buyblack-login-title"
    >
      <div className="buyblack-auth-card relative w-full" data-goodbase-login-panel>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-10 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-label="Close sign-in dialog"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="goodbase-login-kicker">Welcome back</p>
        <h2 id="buyblack-login-title">Sign in to BuyBlack</h2>
        <p className="goodbase-login-subtitle">Access your marketplace, shops, orders, reviews, and community workspace.</p>
        <div data-goodbase-login-providers aria-label="Sign-in providers">
          <button data-goodbase-login-provider type="button" disabled><span className="goodbase-login-provider-mark goodbase-login-provider-mark--google">G</span>Sign in with Google</button>
          <button data-goodbase-login-provider type="button" disabled><span className="goodbase-login-provider-mark">●</span>Sign in with Apple</button>
          <button data-goodbase-login-provider type="button" disabled><span className="goodbase-login-provider-mark goodbase-login-provider-mark--microsoft"><i /><i /><i /><i /></span>Sign in with Microsoft</button>
          <button data-goodbase-login-provider type="button" onClick={beginGoodOSLogin}><span className="goodbase-login-provider-mark">◇</span>Continue with GoodOS</button>
        </div>
        <div data-goodbase-login-divider>OR USE EMAIL</div>
        <form data-goodbase-login-fields onSubmit={submit}>
          {error && (
            <div
              data-goodbase-login-error
              role="alert"
            >
              {error}
              {mfaUrl && (
                <a
                  href={mfaUrl}
                  className="mt-2 flex items-center gap-2 font-bold underline"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Continue verification in GoodOS
                </a>
              )}
            </div>
          )}
          <label data-goodbase-login-field>
            <span>Email address</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
            />
          </label>
          <label data-goodbase-login-field>
            <span><span>Password</span><a data-goodbase-login-recovery href={`${GOODOS_PUBLIC_ORIGIN}/forgot-password`}>Forgot your password?</a></span>
            <span data-goodbase-login-password>
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
            <button data-goodbase-login-password-toggle type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)} />
            </span>
          </label>
          <button
            data-goodbase-login-submit
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign in securely"}
          </button>
        </form>
        <p className="goodbase-login-create">New to BuyBlack? <a data-goodbase-login-recovery href={`${GOODOS_PUBLIC_ORIGIN}/register`}>Create account</a></p>
        <div className="goodbase-login-security"><ShieldCheck className="inline h-4 w-4" /> Authentication and account security are managed through GoodBase.</div>
      </div>
    </div>
  );
}
