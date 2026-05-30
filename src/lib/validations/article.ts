import { z } from "zod";

export const articleSchema = z.object({
  titre: z.string().min(3, "Titre requis (min 3 caractères)").max(200),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug : lettres minuscules, chiffres et tirets uniquement"),
  extrait: z.string().max(300).optional().or(z.literal("")),
  contenu: z.string().min(1, "Le contenu ne peut pas être vide"),
  imagePrincipaleUrl: z.string().url("URL invalide").optional().or(z.literal("")),
  auteur: z.string().min(1).max(100),
  tags: z.array(z.string().max(50)).max(10),
  statut: z.enum(["brouillon", "programme", "publie", "archive"]),
  estPublie: z.boolean(),
  publieLe: z.string().optional().or(z.literal("")),
});

export type ArticleInput = z.infer<typeof articleSchema>;
