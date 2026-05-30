import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { getSiteConfig } from "@/lib/site-config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const description =
    config.metaDescription ??
    `${config.nomSite} - ferme agro-entrepreneuriale à ${
      config.adresse ?? "Allada, Bénin"
    }. Production agricole, formations professionnelles et appui-conseil.`;

  const ogImage = config.logoUrl ?? "/hero-1.jpg";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${config.nomSite} - Ferme agro-entrepreneuriale à ${
        config.adresse ?? "Allada, Bénin"
      }`,
      template: `%s | ${config.nomSite}`,
    },
    description,
    applicationName: config.nomSite,
    authors: [{ name: config.nomSite }],
    keywords: [
      "ferme",
      "agriculture",
      "Bénin",
      "Allada",
      "formation agricole",
      "élevage",
      "agro-entrepreneuriat",
      "appui-conseil",
      config.nomSite,
    ],
    icons: config.faviconUrl
      ? { icon: config.faviconUrl }
      : undefined,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "fr_FR",
      url: SITE_URL,
      siteName: config.nomSite,
      title: `${config.nomSite}${config.slogan ? ` - ${config.slogan}` : ""}`,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.nomSite,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.nomSite}${config.slogan ? ` - ${config.slogan}` : ""}`,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
