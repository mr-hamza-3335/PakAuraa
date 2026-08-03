import dynamic from "next/dynamic";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedCollection from "@/components/FeaturedCollection";
import BestSellers from "@/components/BestSellers";
import PressStrip from "@/components/PressStrip";
import JournalPreview from "@/components/JournalPreview";
import Footer from "@/components/Footer";

// Below-fold sections are code-split into separate chunks — still
// server-rendered for SEO/crawlability, but deferred out of the initial
// client bundle so the hero and first products interact sooner.
const RecentlyViewed = dynamic(() => import("@/components/RecentlyViewed"));
const ScentFinder = dynamic(() => import("@/components/ScentFinder"));
const FragranceFamilies = dynamic(() => import("@/components/FragranceFamilies"));
const WhyPakAuraa = dynamic(() => import("@/components/WhyPakAuraa"));
const Craftsmanship = dynamic(() => import("@/components/Craftsmanship"));
const Ingredients = dynamic(() => import("@/components/Ingredients"));
const Packaging = dynamic(() => import("@/components/Packaging"));
const Testimonials = dynamic(() => import("@/components/Testimonials"));
const InstagramGallery = dynamic(() => import("@/components/InstagramGallery"));
const Newsletter = dynamic(() => import("@/components/Newsletter"));

export default function HomePage() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturedCollection />
      <BestSellers />
      <PressStrip />
      <RecentlyViewed />
      <ScentFinder />
      <FragranceFamilies />
      <WhyPakAuraa />
      <Craftsmanship />
      <Ingredients />
      <Packaging />
      <Testimonials />
      <JournalPreview />
      <InstagramGallery />
      <Newsletter />
      <Footer />
    </main>
  );
}
