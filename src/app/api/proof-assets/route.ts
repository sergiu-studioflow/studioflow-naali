import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const proofAssets = await db
    .select()
    .from(schema.proofAssets)
    .orderBy(asc(schema.proofAssets.sortOrder));

  return NextResponse.json(proofAssets);
}

const createProofAssetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create proof assets" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createProofAssetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [proofAsset] = await db
    .insert(schema.proofAssets)
    .values(parsed.data)
    .returning();

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "proof_asset_created",
    resourceType: "proof_asset",
    resourceId: proofAsset.id,
  });

  return NextResponse.json(proofAsset, { status: 201 });
}
