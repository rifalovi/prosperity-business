import { createHash, randomBytes } from "crypto";

/**
 * Génère un token URL-safe (32 octets → 43 caractères base64url).
 * Le clair est envoyé à l'utilisateur (lien email), le hash est stocké en base.
 */
export function generateToken(): { plain: string; hash: string } {
  const plain = randomBytes(32).toString("base64url");
  const hash = hashToken(plain);
  return { plain, hash };
}

export function hashToken(plain: string): string {
  return createHash("sha256").update(plain).digest("hex");
}

export function tokenExpiry(motif: "invitation" | "reset"): Date {
  // Invitation = 7 jours (le candidat partenaire peut être un peu lent à réagir).
  // Reset = 1 heure (sécurité).
  const ms = motif === "invitation" ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}
