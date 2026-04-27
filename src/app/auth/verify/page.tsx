"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Image from "next/image";
import { Loader2, ArrowRight } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const callbackURL = searchParams.get("callbackURL") || "/dashboard";
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  const verifyURL = token
    ? `/api/auth/magic-link/verify?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callbackURL)}`
    : null;

  function handleVerify() {
    if (!verifyURL) return;
    setLoading(true);
    window.location.href = verifyURL;
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-destructive">
          Invalid or missing verification link.
        </p>
        <a
          href="/login"
          className="inline-block text-sm text-primary underline underline-offset-2"
        >
          Request a new magic link
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Confirm sign in
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Click the button below to complete your sign in
        </p>
      </div>

      <button
        onClick={handleVerify}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Sign in to Naali Portal
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>

      <p className="text-[13px] text-muted-foreground">
        If you didn&apos;t request this, you can safely ignore this page.
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-fade-up w-full max-w-[380px] space-y-8 px-4">
        <div className="flex items-center justify-center gap-3">
          <Image src="/studioflow-logo.png" alt="StudioFlow" width={40} height={40} className="rounded-xl" />
          <span className="text-sm font-light text-muted-foreground">×</span>
          <Image src="/naali-logo.png" alt="Naali" width={40} height={40} className="rounded-xl" />
        </div>
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
