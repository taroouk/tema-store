import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { NewArrivals } from "@/components/home/new-arrivals";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { BestSellers } from "@/components/home/best-sellers";
import { Newsletter } from "@/components/home/newsletter";

export default function HomePage() {
  return (
<>
  <Hero />
  <Categories />
  <NewArrivals />
  <EditorialBanner />
  <BestSellers />
  <Newsletter />
</>
  );
}