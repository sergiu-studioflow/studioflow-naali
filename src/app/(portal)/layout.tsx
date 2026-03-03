import { PortalShell } from "@/components/layout/portal-shell";
import { getAppConfig } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const config = await getAppConfig();

  return (
    <PortalShell config={config} userEmail={user?.email}>
      {children}
    </PortalShell>
  );
}
