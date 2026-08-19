"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import {
  GoodOSLoginShell,
  GoodOSLoginWidget,
} from "../../vendor/goodos-topbar-widget";

const GOODOS_AUTH_ORIGIN = "";
const GOODOS_PUBLIC_ORIGIN = "https://base.goodos.app";

function BuyBlackLoginStory() {
  return (
    <div className="relative isolate flex h-full min-h-screen flex-col overflow-hidden bg-[#120c0a] px-10 py-10 text-[#fffaf2] xl:px-16 xl:py-14">
      <div
        className="absolute inset-0 -z-20 bg-cover bg-[center_top] opacity-40"
        style={{ backgroundImage: "url('/og.png')" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,9,7,0.48)_0%,rgba(18,12,10,0.88)_54%,#120c0a_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 bottom-[-10rem] -z-10 h-[32rem] w-[32rem] rounded-full bg-[#d05334]/20 blur-3xl"
        aria-hidden="true"
      />

      <header className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#c5a059]/55 bg-black/45 text-[#e2ad45] shadow-2xl backdrop-blur">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <div>
          <p className="font-serif text-3xl font-bold leading-none">
            Buy<span className="text-[#c5a059]">Black</span>
          </p>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#e2ad45]">
            Marketplace
          </p>
        </div>
      </header>

      <div className="mt-auto max-w-2xl pb-8">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#c5a059]/45 bg-black/35 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#ebd6a8] backdrop-blur">
          <Store className="h-4 w-4" />
          Community commerce, connected
        </div>
        <h1 className="max-w-xl font-serif text-[clamp(3.25rem,5vw,5.75rem)] font-medium leading-[0.96] tracking-[-0.045em]">
          Discover more. Support with purpose.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-[#e8dfd6]">
          Shop verified Black-owned businesses, follow the people behind the
          products, and keep every order in one trusted marketplace.
        </p>

        <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-3">
          {[
            ["Verified", "Trusted businesses"],
            ["Connected", "One community"],
            ["Secure", "GoodOS identity"],
          ].map(([title, copy]) => (
            <div
              key={title}
              className="rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur-md"
            >
              <CheckCircle2 className="mb-3 h-5 w-5 text-[#e2ad45]" />
              <strong className="block text-sm text-white">{title}</strong>
              <span className="mt-1 block text-xs text-[#c8bdb2]">{copy}</span>
            </div>
          ))}
        </div>
      </div>

      <footer className="flex items-center gap-2 border-t border-white/10 pt-5 text-xs text-[#c8bdb2]">
        <ShieldCheck className="h-4 w-4 text-[#10b981]" />
        Protected by the shared GoodOS security layer
      </footer>
    </div>
  );
}

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

  useEffect(() => {
    if (!open) return;

    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

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
      className="fixed inset-0 z-[9999] overflow-hidden bg-[#120c0a]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buyblack-login-title"
    >
      <GoodOSLoginShell
        brandPanel={<BuyBlackLoginStory />}
        className="buyblack-login-shell"
      >
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
          homeHref="/"
          initialMode="dark"
          mobileBrand={
            <div className="font-serif text-2xl font-bold text-white">
              Buy<span className="text-[#c5a059]">Black</span>
            </div>
          }
          securityTitle="Secure marketplace access powered by GoodBase."
          securityDescription="Your identity and account session are protected through the shared GoodOS security layer."
        />
      </GoodOSLoginShell>
    </div>
  );
}
