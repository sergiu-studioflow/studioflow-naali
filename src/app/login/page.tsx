"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (error) {
      setError(error.message ?? "Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="animate-fade-up w-full max-w-[380px] space-y-8 px-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <Image src="/studioflow-logo.png" alt="StudioFlow" width={40} height={40} className="rounded-xl" />
            <span className="text-sm font-light text-muted-foreground">×</span>
            <Image src="/naali-logo.png" alt="Naali" width={40} height={40} className="rounded-xl" />
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Sign in to your creative studio
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoComplete="email"
              className="mt-1.5 block w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-xs placeholder:text-muted-foreground transition-all duration-150 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1.5 block w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-xs placeholder:text-muted-foreground transition-all duration-150 focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>

          {error && (
            <p className="text-[13px] text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
