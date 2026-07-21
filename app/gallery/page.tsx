import type { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Original, non-explicit demo imagery illustrating the consent-first media workflow.",
  alternates: { canonical: "/gallery" },
};
const images = [
  { src: "/images/hero-lounge.png", alt: "Fictional adult model in a dark hotel lounge" },
  { src: "/images/profile-mumbai.png", alt: "Fictional adult demo portrait in a Mumbai lobby" },
  {
    src: "/images/profile-bengaluru.png",
    alt: "Fictional adult demo portrait in a Bengaluru lounge",
  },
];
export default function GalleryPage() {
  return (
    <div className="section-space">
      <div className="site-container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gallery" }]} />
        <h1 className="font-display text-5xl font-bold tracking-[-0.055em] sm:text-6xl">
          Premium gallery preview
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
          These original AI-generated images portray fictional adults. Production media requires
          private consent evidence, asset ownership and complete Cloudinary metadata.
        </p>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {images.map((image, index) => (
            <figure
              key={image.src}
              className={`relative overflow-hidden rounded-[24px] border border-white/12 ${index === 0 ? "aspect-[16/9] md:col-span-2" : "aspect-[4/5]"}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={index === 0 ? "100vw" : "50vw"}
                className="object-cover"
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
