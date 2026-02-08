import { useEffect, useState, lazy, Suspense, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

// Lazy load heavy components
const SocialProof = lazy(() => import("@/components/SocialProof"));
const FeaturedWork = lazy(() => import("@/components/FeaturedWork"));
const About = lazy(() => import("@/components/About"));
const Career = lazy(() => import("@/components/Career"));
const Blog = lazy(() => import("@/components/Blog"));
const NewsFeed = lazy(() => import("@/components/NewsFeed"));
const Contact = lazy(() => import("@/components/Contact"));

// Lazy load custom cursor (only for desktop)
const MagneticCursor = lazy(() =>
  import("@/components/ui/MagneticCursor").then(mod => ({ default: mod.MagneticCursor }))
);

// Device performance detection
const useDevicePerformance = () => {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for mobile
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    setIsMobile(mobile);

    // Check for low-end device indicators
    const lowEnd =
      navigator.hardwareConcurrency <= 2 || // 2 or fewer CPU cores
      (navigator as any).deviceMemory <= 2 || // 2GB or less RAM
      mobile; // Treat mobile as lower performance

    setIsLowEnd(lowEnd);
  }, []);

  return { isLowEnd, isMobile };
};

// Simple loader - optimized with no heavy animations
const Loader = memo(({ isLoading }: { isLoading: boolean }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative flex flex-col items-center gap-6">
            {/* Simple CSS spinner - no JS animation overhead */}
            <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground text-sm animate-pulse">
              Loading...
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

Loader.displayName = 'Loader';

// Section fallback for lazy loading
const SectionFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { isLowEnd, isMobile } = useDevicePerformance();

  useEffect(() => {
    // Faster loading - just wait for initial paint
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Wrapper component that conditionally includes MagneticCursor
  const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
    // Skip magnetic cursor on mobile/low-end for performance
    if (isMobile || isLowEnd) {
      return <>{children}</>;
    }

    return (
      <Suspense fallback={<>{children}</>}>
        <MagneticCursor>{children}</MagneticCursor>
      </Suspense>
    );
  };

  return (
    <>
      {/* Simple loader */}
      <Loader isLoading={isLoading} />

      {/* Main content */}
      <ContentWrapper>
        <div className="min-h-screen bg-background overflow-x-hidden">
          {/* Note: 3D Background is integrated into Hero section to avoid multiple WebGL contexts */}

          {/* Navigation - always load immediately */}
          <Navigation />

          {/* Main sections with lazy loading */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Hero />

            <Suspense fallback={<SectionFallback />}>
              <SocialProof />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <FeaturedWork />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <About />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Career />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Blog />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <NewsFeed />
            </Suspense>

            <Suspense fallback={<SectionFallback />}>
              <Contact />
            </Suspense>

            <Footer />
          </motion.main>
        </div>
      </ContentWrapper>
    </>
  );
};

export default Index;