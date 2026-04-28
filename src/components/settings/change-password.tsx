"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setLoading(false);

    if (error) {
      setError(error.message ?? "Failed to change password.");
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label htmlFor="current" className="block text-[13px] font-medium text-foreground">
          Current password
        </label>
        <input
          id="current"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1.5 block w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-xs focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>
      <div>
        <label htmlFor="new" className="block text-[13px] font-medium text-foreground">
          New password
        </label>
        <input
          id="new"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1.5 block w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-xs focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
        <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="block text-[13px] font-medium text-foreground">
          Confirm new password
        </label>
        <input
          id="confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="mt-1.5 block w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground shadow-xs focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>

      {error && <p className="text-[13px] text-destructive">{error}</p>}
      {success && (
        <p className="flex items-center gap-1.5 text-[13px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Password updated. Other sessions have been signed out.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update password"}
      </button>
    </form>
  );
}
