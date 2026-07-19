import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { NewArrivals } from "@/components/home/new-arrivals";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { BestSellers } from "@/components/home/best-sellers";
import { Newsletter } from "@/components/home/newsletter";
import { BrandStory } from "@/components/home/brand-story";
import { CinematicVideo } from "@/components/home/cinematic-video";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { Reveal } from "@/components/ux/reveal";

export default function HomePage() {
  return (
    <>
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
        <CinematicVideo />
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
