"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";
import { sendLeadConfirmation, sendLeadNotification } from "@/lib/email";
import { getClientIp, hashIp, rateLimit } from "@/lib/rate-limit";

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof LeadInput, string>> };

const ONE_HOUR_MS = 60 * 60 * 1000;
const MAX_PER_HOUR = 3;

export async function submitLead(input: unknown): Promise<SubmitLeadResult> {
  // 1. Re-validation côté serveur (indépendante du client)
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof LeadInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof LeadInput;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { ok: false, error: "Données invalides", fieldErrors };
  }

  const data = parsed.data;

  // 2. Honeypot : si rempli, on simule un succès (ne pas alerter le bot)
  if (data.website && data.website.length > 0) {
    return { ok: true };
  }

  // 3. Rate limiting (max 3 messages/h/IP)
  const h = await headers();
  const ip = getClientIp(h);
  const ipHash = hashIp(ip);
  const rl = rateLimit(`lead:${ipHash}`, MAX_PER_HOUR, ONE_HOUR_MS);
  if (!rl.success) {
    return {
      ok: false,
      error: "Trop de messages envoyés. Réessayez dans une heure.",
    };
  }

  // 4. INSERT en base
  let leadId: string;
  try {
    const lead = await prisma.lead.create({
      data: {
        nomComplet: data.nomComplet,
        email: data.email,
        telephone: data.telephone || null,
        sujet: data.sujet,
        message: data.message,
        ipHash,
      },
      select: { id: true },
    });
    leadId = lead.id;
  } catch (err) {
    console.error("[submitLead] DB error:", err);
    return {
      ok: false,
      error: "Service temporairement indisponible. Veuillez réessayer.",
    };
  }

  // 5. Envoi des emails (best-effort - lead déjà sauvegardé)
  const emailPayload = {
    nomComplet: data.nomComplet,
    email: data.email,
    telephone: data.telephone || null,
    sujet: data.sujet,
    message: data.message,
  };

  const results = await Promise.allSettled([
    sendLeadNotification(emailPayload),
    sendLeadConfirmation(data.email, data.nomComplet),
  ]);

  for (const r of results) {
    if (r.status === "rejected") {
      console.error(`[submitLead] Email failed for lead ${leadId}:`, r.reason);
    }
  }

  return { ok: true };
}
