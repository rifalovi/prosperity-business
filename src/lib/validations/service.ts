import { z } from "zod";

export const serviceSchema = z.object({
  titre: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug : minuscules, chiffres et tirets"),
  descriptionCourte: z.string().min(5).max(200),
  descriptionLongue: z.string().optional().or(z.literal("")),
  domaine: z.enum(["agriculture", "formation"]),
  sousCategorie: z.string().max(80).optional().or(z.literal("")),
  icone: z.string().max(50).optional().or(z.literal("")),
  imageUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  ordreAffichage: z.number().int().min(0),
  estPublie: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
