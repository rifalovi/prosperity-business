import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SiteConfigData = {
  nomSite: string;
  slogan: string | null;
  emailContact: string;
  telephone1: string | null;
  telephone2: string | null;
  adresse: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  metaDescription: string | null;
};

const FALLBACK: SiteConfigData = {
  nomSite: "Prosperity Business",
  slogan: "Nourrir. Former. Prospérer.",
  emailContact: "contact@prosperitybusiness.bj",
  telephone1: null,
  telephone2: null,
  adresse: "Allada, Bénin",
  facebookUrl: null,
  instagramUrl: null,
  whatsappNumber: null,
  logoUrl: null,
  faviconUrl: null,
  metaDescription: null,
};

export const getSiteConfig = cache(async (): Promise<SiteConfigData> => {
  try {
    const config = await prisma.siteConfig.findFirst();
    return config ?? FALLBACK;
  } catch {
    return FALLBACK;
  }
});
