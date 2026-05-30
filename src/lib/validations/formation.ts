import { z } from "zod";

export const formationSchema = z.object({
  titre: z.string().min(2).max(200),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres et tirets"),
  cible: z.string().min(2).max(200),
  objectifs: z.array(z.string().max(200)).max(15),
  duree: z.string().max(80).optional().or(z.literal("")),
  modalite: z.enum(["presentiel", "terrain", "hybride"]),
  cout: z.string().max(80).optional().or(z.literal("")),
  prochaineSession: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  serviceId: z.string().uuid("UUID invalide").optional().or(z.literal("")),
  estPublie: z.boolean(),
});

export type FormationInput = z.infer<typeof formationSchema>;
