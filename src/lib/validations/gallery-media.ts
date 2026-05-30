import { z } from "zod";
import { GALLERY_CATEGORIES } from "@/lib/video";
import { parseVideoSource } from "@/lib/video";

export const videoMediaSchema = z.object({
  url: z
    .string()
    .url("URL invalide")
    .refine(
      (v) => parseVideoSource(v) !== null,
      "URL non reconnue (YouTube, Cloudinary ou fichier .mp4/.webm attendu)",
    ),
  altText: z
    .string()
    .min(3, "Le texte alternatif doit contenir au moins 3 caractères")
    .max(150),
  legende: z.string().max(200).optional().or(z.literal("")),
  categorie: z.enum(GALLERY_CATEGORIES).optional(),
  ordre: z.number().int().min(0),
  estPublie: z.boolean(),
});

export type VideoMediaInput = z.infer<typeof videoMediaSchema>;
