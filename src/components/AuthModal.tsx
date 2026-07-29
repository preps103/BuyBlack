"use client";

import { useState } from "react";
import { Loader2, LogIn, ShieldCheck, X } from "lucide-react";

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

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-bazaar-dark/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buyblack-login-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Close sign-in dialog"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="border-b border-gray-100 bg-[#FAF8F5] px-8 pb-6 pt-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bazaar-dark text-lg font-black text-gold-base">
              G
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rust">
                GoodOS Account
              </p>
              <p className="font-serif text-xl font-bold">BuyBlack</p>
            </div>
          </div>
          <h2 id="buyblack-login-title" className="font-serif text-3xl font-bold">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Use the same secure account you use across GoodOS.
          </p>
        </div>
        <form className="space-y-5 p-8" onSubmit={submit}>
          {error && (
            <div
              className="rounded-xl border border-rust/20 bg-rust/5 px-4 py-3 text-sm font-medium text-rust-dark"
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
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-rust"
              placeholder="you@example.com"
            />
          </label>
          <label className="block text-sm font-semibold">
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-rust"
              placeholder="Enter your password"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-rust py-3.5 font-bold text-white hover:bg-rust-dark disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {loading ? "Signing in…" : "Sign In with GoodOS"}
          </button>
        </form>
      </div>
    </div>
  );
}
