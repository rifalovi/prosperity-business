import { z } from "zod";

export const leadSchema = z.object({
  nomComplet: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(120, "Le nom est trop long"),
  email: z.string().email("Adresse email invalide"),
  telephone: z
    .string()
    .max(30)
    .optional()
    .or(z.literal("")),
  sujet: z.enum(["information", "partenariat", "formation", "commande", "autre"]),
  message: z
    .string()
    .min(20, "Le message doit contenir au moins 20 caractères")
    .max(5000, "Le message est trop long"),
  // Honeypot anti-bot - doit rester vide
  website: z.string().max(0).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
