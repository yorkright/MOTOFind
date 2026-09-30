import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import CarShowcase from "@/components/landing/CarShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import Capabilities from "@/components/landing/Capabilities";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import RoadDivider from "@/components/landing/RoadDivider";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-base">
      <Navbar />
      <Hero />
      <RoadDivider />
      <CarShowcase />
      <HowItWorks />
      <Capabilities />
      <RoadDivider />
      <CTA />
      <Footer />
    </main>
  );
}
