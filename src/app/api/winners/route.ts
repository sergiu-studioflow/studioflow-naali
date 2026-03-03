import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const list = await db
    .select()
    .from(schema.winners)
    .orderBy(desc(schema.winners.createdAt));

  return NextResponse.json(list);
}

const createWinnerSchema = z.object({
  name: z.string().min(1),
  platform: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const body = await request.json();
  const parsed = createWinnerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const [winner] = await db
    .insert(schema.winners)
    .values(parsed.data)
    .returning();

  return NextResponse.json(winner, { status: 201 });
}
