"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/hero-1.jpg", alt: "Ferme Prosperity Business - élevage" },
  { src: "/hero-2.jpg", alt: "Ferme Prosperity Business - formations" },
  { src: "/hero-3.jpg", alt: "Ferme Prosperity Business - production agricole" },
];

export function HeroSlideshow({
  slogan,
  adresse,
}: {
  slogan: string;
  adresse: string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-[75vh] min-h-[480px] overflow-hidden text-white sm:h-[85vh] sm:min-h-[560px]">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay semi-transparent pour la lisibilité */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Contenu hero */}
      <div className="relative z-10 flex h-full items-center justify-center px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-3xl font-bold leading-tight drop-shadow-lg sm:text-5xl md:text-6xl">
            {slogan}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/90 drop-shadow sm:mt-6 sm:text-lg">
            Ferme agro-entrepreneuriale à {adresse} - production agricole,
            formations professionnelles et appui-conseil.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link
              href="/services"
              className="rounded-lg bg-[var(--color-earth)] px-6 py-3 text-center font-medium transition-colors hover:bg-[var(--color-earth)]/90"
            >
              Découvrir nos services
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/30 px-6 py-3 text-center font-medium transition-colors hover:bg-white/10"
            >
              Nous contacter
            </Link>
          </div>

          {/* Indicateurs de slide */}
          <div className="mt-8 flex justify-center gap-2" role="tablist" aria-label="Diaporama">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Photo ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
