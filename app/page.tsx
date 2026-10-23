import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { NewArrivals } from "@/components/home/new-arrivals";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { BestSellers } from "@/components/home/best-sellers";
import { Newsletter } from "@/components/home/newsletter";
import { BrandStory } from "@/components/home/brand-story";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { Reveal } from "@/components/ux/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/constants/site";
import { getSettings } from "@/lib/settings";

export const metadata = {
  title: { absolute: "Tema Label | Tema Store — Premium Everyday Essentials in Egypt" },
  alternates: { canonical: "/" },
};

const structuredData = (links: string[]) => [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    alternateName: siteConfig.alternateNames,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logos/tema-black.png`,
    description: siteConfig.description,
    ...(links.length ? { sameAs: links } : {}),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.alternateNames,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

export default async function HomePage() {
  const settings = await getSettings();
  const links = Object.values(settings.links).filter(Boolean);

  return (
    <>
      <JsonLd data={structuredData(links)} />
      <Hero />
      <Reveal>
        <Categories />
      </Reveal>
      <Reveal>
        <NewArrivals />
      </Reveal>
      <Reveal>
        <EditorialBanner />
      </Reveal>
      <Reveal>
        <BestSellers />
      </Reveal>
      <Reveal>
        <BrandStory />
      </Reveal>
      <Reveal>
        <WhyChooseUs />
      </Reveal>
      <Reveal>
        <InstagramGallery />
      </Reveal>
      <Reveal>
        <Newsletter />
      </Reveal>
    </>
  );
}
