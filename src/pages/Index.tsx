import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import FeaturedWork from "@/components/FeaturedWork";
import About from "@/components/About";
import Career from "@/components/Career";
import Blog from "@/components/Blog";
import NewsFeed from "@/components/NewsFeed";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { BackgroundScene } from "@/components/3d/Scene";
import { MagneticCursor } from "@/components/ui/MagneticCursor";

// Custom loader component
const Loader = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <div className="relative flex flex-col items-center gap-8">
            {/* Animated circuit loader */}
            <motion.div
              className="relative w-24 h-24"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Outer ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--primary) / 0.2)"
                  strokeWidth="2"
                />
                {/* Animated arc */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="70 200"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -270 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Inner elements */}
                <circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="hsl(var(--secondary) / 0.3)"
                  strokeWidth="1"
                />
                {/* Center node */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="8"
                  fill="hsl(var(--primary))"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </svg>
            </motion.div>

            {/* Loading text */}
            <motion.div
              className="text-muted-foreground text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Initializing...
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for initial resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Custom loader */}
      <Loader isLoading={isLoading} />

      {/* Main content */}
      <MagneticCursor>
        <div className="min-h-screen bg-background overflow-x-hidden">
          {/* Global 3D Background */}
          <BackgroundScene />

          {/* Navigation */}
          <Navigation />

          {/* Main sections */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Hero />
            <SocialProof />
            <FeaturedWork />
            <About />
            <Career />
            <Blog />
            <NewsFeed />
            <Contact />
            <Footer />
          </motion.main>
        </div>
      </MagneticCursor>
    </>
  );
};

export default Index;