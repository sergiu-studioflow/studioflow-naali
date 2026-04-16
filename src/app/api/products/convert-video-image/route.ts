import { db, schema } from "@/lib/db";
import { requireAuth, isAuthError } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { downloadFromR2, uploadToR2, r2KeyFromUrl, r2Key } from "@/lib/r2";
import sharp from "sharp";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Target: 9:16 portrait (e.g. 1080x1920)
const TARGET_WIDTH = 1080;
const TARGET_HEIGHT = 1920;

/**
 * POST /api/products/convert-video-image
 *
 * Takes a product's existing imageUrl, resizes/pads it to 9:16,
 * uploads to R2, and saves as videoImageUrl.
 *
 * Body: { productId: string } or { productIds: string[] } for bulk
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  if (auth.portalUser.role === "viewer") {
    return NextResponse.json({ error: "Viewers cannot modify products" }, { status: 403 });
  }

  const body = await request.json();
  const productIds: string[] = body.productIds || (body.productId ? [body.productId] : []);

  if (productIds.length === 0) {
    return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
  }

  const results: { id: string; name: string; status: string; videoImageUrl?: string; error?: string }[] = [];

  for (const productId of productIds) {
    try {
      // Fetch product
      const [product] = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, productId));

      if (!product) {
        results.push({ id: productId, name: "?", status: "error", error: "Product not found" });
        continue;
      }

      if (!product.imageUrl) {
        results.push({ id: productId, name: product.name, status: "skipped", error: "No source image" });
        continue;
      }

      if (product.videoImageUrl) {
        results.push({ id: productId, name: product.name, status: "skipped", error: "Already has video image" });
        continue;
      }

      // Download source image from R2
      const r2SourceKey = r2KeyFromUrl(product.imageUrl);
      let imageBuffer: Buffer;

      if (r2SourceKey) {
        const downloaded = await downloadFromR2(r2SourceKey);
        imageBuffer = downloaded.buffer;
      } else {
        // External URL — fetch it
        const res = await fetch(product.imageUrl);
        if (!res.ok) {
          results.push({ id: productId, name: product.name, status: "error", error: "Failed to download source image" });
          continue;
        }
        imageBuffer = Buffer.from(await res.arrayBuffer());
      }

      // Resize to 9:16 with white background padding
      const resized = await sharp(imageBuffer)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .png()
        .toBuffer();

      // Upload to R2
      const filename = `${randomUUID()}.png`;
      const key = r2Key(process.env.BRAND_SLUG || "demo", "video-generation/products", filename);
      const videoImageUrl = await uploadToR2(key, resized, "image/png");

      // Update product
      await db
        .update(schema.products)
        .set({ videoImageUrl, updatedAt: new Date() })
        .where(eq(schema.products.id, productId));

      results.push({ id: productId, name: product.name, status: "converted", videoImageUrl });
    } catch (err) {
      results.push({
        id: productId,
        name: "?",
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({
    total: results.length,
    converted: results.filter((r) => r.status === "converted").length,
    skipped: results.filter((r) => r.status === "skipped").length,
    errors: results.filter((r) => r.status === "error").length,
    results,
  });
}
