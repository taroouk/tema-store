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

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <NewArrivals />
      <EditorialBanner />
      <BestSellers />
      <BrandStory />
      <CinematicVideo />
      <WhyChooseUs />
      <InstagramGallery />
      <Newsletter />
    </>
  );
}
