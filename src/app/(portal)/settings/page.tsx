import { createClient } from "@/lib/supabase/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { Settings, User, Shield } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [portalUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.authUserId, user.id))
    .limit(1);

  return {
    authUser: user,
    portalUser: portalUser || null,
  };
}

export default async function SettingsPage() {
  const userData = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Account settings and preferences
        </p>
      </div>

      {/* User Profile */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <User className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Profile</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Email</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData?.authUser?.email || "--"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Display Name</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData?.portalUser?.displayName || "--"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Role</p>
            <p className="mt-1 text-sm capitalize text-gray-900 dark:text-white">
              {userData?.portalUser?.role || "--"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Last Login</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData?.portalUser?.lastLoginAt
                ? formatDateTime(userData.portalUser.lastLoginAt)
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Member Since</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData?.portalUser?.createdAt
                ? formatDateTime(userData.portalUser.createdAt)
                : "--"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Account Status</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData?.portalUser?.isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              ) : (
                <span className="text-gray-400">--</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <Shield className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Security</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Authentication is managed via magic link. No password is required.
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Auth provider: <span className="font-medium text-gray-700 dark:text-gray-300">Supabase Auth</span>
          </p>
        </div>
      </div>

      {/* Notification Preferences Placeholder */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <Settings className="h-4 w-4 text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Notification preferences coming soon. You will be able to configure email alerts for script completions and review updates.
          </p>
        </div>
      </div>
    </div>
  );
}
