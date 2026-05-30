import type { Metadata } from "next";
import { MapPin, Phone, MessageCircle, Clock, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/public/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Prosperity Business à Allada (Bénin) pour vos demandes d'information, partenariat, formation ou commande. Réponse sous 48h ouvrables - formulaire, téléphone ou WhatsApp.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title: "Contact - Prosperity Business",
    description:
      "Une question, un projet, une visite de la ferme ? Notre équipe vous répond du lundi au samedi à Allada, Bénin.",
    url: "/contact",
    images: ["/hero-3.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact - Prosperity Business",
    description:
      "Une question, un projet, une visite de la ferme ? Notre équipe vous répond du lundi au samedi à Allada, Bénin.",
    images: ["/hero-3.jpg"],
  },
};

const WHATSAPP_NUMBER = "22901962115134";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Bonjour Prosperity Business, je souhaite obtenir des informations.",
)}`;

export default function ContactPage() {
  return (
    <div className="bg-white">
      <section className="bg-[var(--color-cream)] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="font-display text-4xl font-bold text-[var(--color-forest)] md:text-5xl">
            Contactez-nous
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Réponse sous 48h ouvrables - du lundi au samedi.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.5fr_1fr]">
          {/* FORMULAIRE */}
          <div>
            <h2 className="font-display text-2xl font-bold">
              Envoyez-nous un message
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Les champs marqués d&apos;un{" "}
              <span className="text-[var(--color-danger)]">*</span> sont obligatoires.
            </p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          {/* INFOS DE CONTACT */}
          <aside className="space-y-6 rounded-2xl bg-[var(--color-cream)] p-6 lg:p-8">
            {/* Message d'accueil chaleureux */}
            <div className="rounded-xl border border-[var(--color-leaf)]/30 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-leaf)]/25 to-[var(--color-forest)]/15 text-[var(--color-forest)]">
                  <Sparkles className="size-4" aria-hidden />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-[var(--color-forest)]">
                    Bienvenue !
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Une question, un projet, une visite de la ferme ? Notre équipe vous répond avec attention - en français ou en fon - du lundi au samedi.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-[var(--color-forest)]">
                Nos coordonnées
              </h2>
            </div>

            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin
                  className="size-5 shrink-0 text-[var(--color-earth)]"
                  aria-hidden
                />
                <span>Allada, République du Bénin</span>
              </li>
              <li className="flex gap-3">
                <Phone
                  className="size-5 shrink-0 text-[var(--color-earth)]"
                  aria-hidden
                />
                <div className="space-y-1">
                  <a
                    href="tel:+22901962115134"
                    className="block hover:text-[var(--color-forest)]"
                  >
                    +229 01 96 21 15 34
                  </a>
                  <a
                    href="tel:+22901953527131"
                    className="block hover:text-[var(--color-forest)]"
                  >
                    +229 01 95 35 27 31
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Clock
                  className="size-5 shrink-0 text-[var(--color-earth)]"
                  aria-hidden
                />
                <div>
                  <p className="font-medium">Horaires d&apos;ouverture</p>
                  <p className="text-muted-foreground">Lun - Sam · 8h - 18h</p>
                </div>
              </li>
            </ul>

            {/* WhatsApp - vert proéminent */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 rounded-lg bg-[#25D366] px-5 py-4 font-medium text-white shadow-sm transition-all hover:bg-[#1ebe5d] hover:shadow-md"
            >
              <span className="flex items-center gap-2">
                <MessageCircle className="size-5" aria-hidden />
                Écrire sur WhatsApp
              </span>
              <span className="text-sm font-semibold tracking-wide text-white/95">
                +229 01 96 21 15 34
              </span>
            </a>

            <p className="text-xs text-muted-foreground">
              Alternative rapide au formulaire - réponse en quelques heures.
            </p>
          </aside>
        </div>
      </section>
    </div>
  );
}
