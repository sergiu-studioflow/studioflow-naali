import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { uploadToR2, r2KeyFromUrl, downloadFromR2 } from "@/lib/r2";
import { v4 as uuid } from "uuid";
import { r2Prefix } from "@/lib/static-ads/config";

export const dynamic = "force-dynamic";

/**
 * POST /api/winners/save-from-research
 * Save a competitor research ad image to the Winners Library.
 * Body: { imageUrl, name, brandName? }
 */
export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (isAuthError(authResult)) return authResult;
  const { portalUser } = authResult;

  const body = await req.json();
  const { imageUrl, name, brandName } = body as {
    imageUrl?: string;
    name?: string;
    brandName?: string;
  };

  if (!imageUrl || !name) {
    return NextResponse.json({ error: "imageUrl and name are required" }, { status: 400 });
  }

  // Fetch the source image. If it's already in R2, pull from R2 directly;
  // otherwise download over HTTP (Meta/scraper CDN URL).
  let buffer: Buffer;
  let contentType: string;
  const r2Key = r2KeyFromUrl(imageUrl);
  if (r2Key) {
    ({ buffer, contentType } = await downloadFromR2(r2Key));
  } else {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch source image (${res.status})` },
        { status: 502 }
      );
    }
    contentType = res.headers.get("content-type") || "image/jpeg";
    buffer = Buffer.from(await res.arrayBuffer());
  }

  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpeg";
  const winnersKey = `${r2Prefix("winners-library")}/${uuid()}.${ext}`;
  const storedUrl = await uploadToR2(winnersKey, buffer, contentType);

  const [winner] = await db
    .insert(schema.winnersLibrary)
    .values({
      userId: portalUser.id,
      name,
      imageUrl: storedUrl,
      tags: brandName || null,
    })
    .returning();

  return NextResponse.json(winner, { status: 201 });
}
