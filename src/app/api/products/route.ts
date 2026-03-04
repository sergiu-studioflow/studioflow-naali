import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { asc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const items = await db
    .select()
    .from(schema.products)
    .orderBy(asc(schema.products.sortOrder));

  return NextResponse.json(items);
}

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot create products" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const [product] = await db
    .insert(schema.products)
    .values(parsed.data)
    .returning();

  await db.insert(schema.activityLog).values({
    userId: auth.portalUser.id,
    action: "product_created",
    resourceType: "product",
    resourceId: product.id,
  });

  return NextResponse.json(product, { status: 201 });
}
