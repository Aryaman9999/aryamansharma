import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import FeaturedWork from "@/components/FeaturedWork";
import About from "@/components/About";
import Career from "@/components/Career";
import Blog from "@/components/Blog";
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
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;