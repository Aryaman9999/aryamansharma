import { useEffect, useState, lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

// Lazy load ScrollSequence so it doesn't block initial paint
const ScrollSequence = lazy(() => import("@/components/ScrollSequence"));

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


// Section fallback for lazy loading - matches approximate real section heights to prevent CLS
const SectionFallback = ({ minHeight = '600px' }: { minHeight?: string }) => (
  <div className="flex items-center justify-center" style={{ minHeight }}>
    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const { isLowEnd, isMobile } = useDevicePerformance();

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
    <ContentWrapper>
      <div className="min-h-screen bg-transparent overflow-x-hidden relative">
        {/* Navigation - always load immediately */}
        <Navigation />

          <main>
            <Hero isLowEnd={isLowEnd} />

            <Suspense fallback={null}>
              <ScrollSequence 
                frameCount={isLowEnd ? 40 : 80}
                urlFunction={(frame) => {
                  const actualFrame = isLowEnd ? (frame * 2 + 1) : (frame + 1);
                  return `/frames/frame_${actualFrame.toString().padStart(4, '0')}.webp`;
                }}
              />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight="100px" />}>
              <SocialProof />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight="800px" />}>
              <FeaturedWork />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight="600px" />}>
              <About />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight="700px" />}>
              <Career />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight="500px" />}>
              <Blog />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight="600px" />}>
              <NewsFeed />
            </Suspense>

            <Suspense fallback={<SectionFallback minHeight="500px" />}>
              <Contact />
            </Suspense>

            <Footer />
          </main>
        </div>
      </ContentWrapper>
  );
};

export default Index;