"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { GoodOSLoginWidget } from "@goodos/topbar-widget";

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

  if (!open) return null;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
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
    // This intentionally leaves BuyBlack for the shared GoodOS authentication UI.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href =
      `${GOODOS_PUBLIC_ORIGIN}/auth/ui?redirect=${encodeURIComponent(window.location.origin)}`;
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-bazaar-dark/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buyblack-login-title"
    >
      <div className="relative h-[min(920px,calc(100vh-2rem))] w-full max-w-[760px] overflow-hidden rounded-[28px]" data-goodbase-login-panel>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 z-20 rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-label="Close sign-in dialog"
        >
          <X className="h-5 w-5" />
        </button>
        <GoodOSLoginWidget
          appName="BuyBlack"
          subtitle="Access your marketplace, shops, orders, reviews, and community workspace."
          accent="#c9a227"
          accentInk="#090909"
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={submit}
          onGoodOSSignIn={beginGoodOSLogin}
          providerAvailability={{ google: false, apple: false, microsoft: false }}
          onForgotPassword={() => { window.location.href = `${GOODOS_PUBLIC_ORIGIN}/forgot-password`; }}
          onCreateAccount={() => { window.location.href = `${GOODOS_PUBLIC_ORIGIN}/register`; }}
          loading={loading}
          error={error}
          initialMode="dark"
        />
      </div>
    </div>
  );
}
