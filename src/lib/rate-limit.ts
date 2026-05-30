import { createHash } from "node:crypto";

/**
 * Rate limiter à fenêtre glissante.
 *
 * Implémentation in-memory : suffisante pour le dev et les déploiements
 * mono-instance. En production serverless (Vercel multi-régions), passer
 * à Upstash Redis via UPSTASH_REDIS_REST_URL - l'API publique reste identique.
 */

type Bucket = { timestamps: number[] };
const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  const cutoff = now - windowMs;

  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    return {
      success: false,
      remaining: 0,
      resetAt: oldest + windowMs,
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  return {
    success: true,
    remaining: limit - bucket.timestamps.length,
    resetAt: now + windowMs,
  };
}

/**
 * Hash d'IP pour stockage RGPD-friendly (jamais d'IP en clair en base).
 */
export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/**
 * Extraction d'IP depuis les headers Next.js.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}

// ────────────────────────────────────────────────────────────────────────────
// Compteur d'échecs (login brute-force)
// ────────────────────────────────────────────────────────────────────────────

const failures = new Map<string, number[]>();

export function isBlocked(key: string, maxFailures: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const arr = (failures.get(key) ?? []).filter((t) => t > cutoff);
  failures.set(key, arr);
  return arr.length >= maxFailures;
}

export function recordFailure(key: string, windowMs: number): void {
  const now = Date.now();
  const cutoff = now - windowMs;
  const arr = (failures.get(key) ?? []).filter((t) => t > cutoff);
  arr.push(now);
  failures.set(key, arr);
}

export function clearFailures(key: string): void {
  failures.delete(key);
}
