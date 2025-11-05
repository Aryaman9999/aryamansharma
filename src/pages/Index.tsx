import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import FeaturedWork from "@/components/FeaturedWork";
import About from "@/components/About";
import Career from "@/components/Career";
import Blog from "@/components/Blog";
import LinkedInBadge from "@/components/LinkedInBadge"; // <-- 1. IMPORT IT
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <SocialProof />
      <FeaturedWork />
      <About />
      <Career />
      <Blog />
      <LinkedInBadge /> {/* <-- 2. ADD IT HERE */}
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;