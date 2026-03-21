import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

interface ScrollSequenceProps {
  frameCount: number;
  urlFunction: (frame: number) => string;
  className?: string;
}

const ScrollSequence = ({ frameCount, urlFunction, className = "" }: ScrollSequenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(frameCount).fill(null));
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // Preload all images logic
  useEffect(() => {
    let isMounted = true;
    let loadedCount = 0;

    const loadImages = async () => {
      // 1. Load the first crucial frame instantly and await ONLY this one
      try {
        const firstImg = new Image();
        firstImg.decoding = "async";
        firstImg.src = urlFunction(0);
        
        await new Promise((resolve) => {
          firstImg.onload = resolve;
          firstImg.onerror = resolve; // Continue on error
        });

        if (!isMounted) return;

        imagesRef.current[0] = firstImg;
        loadedCount++;
        setImagesLoaded(loadedCount);

        // Instantly draw the first frame so the background fills
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx && firstImg.complete && firstImg.naturalWidth > 0) {
            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = firstImg.width / firstImg.height;
            let drawWidth = canvas.width;
            let drawHeight = canvas.height;
            let offsetX = 0;
            let offsetY = 0;
            if (canvasRatio > imgRatio) {
              drawHeight = canvas.width / imgRatio;
              offsetY = (canvas.height - drawHeight) / 2;
            } else {
              drawWidth = canvas.height * imgRatio;
              offsetX = (canvas.width - drawWidth) / 2;
            }
            ctx.drawImage(firstImg, offsetX, offsetY, drawWidth, drawHeight);
          }
        }
      } catch (e) {
        console.error("Failed loading initial frame", e);
      }

      // 2. Queue the rest of the sequence in the background (concurrently unblocked)
      for (let i = 1; i < frameCount; i++) {
        if (!isMounted) break;
        
        const img = new Image();
        img.decoding = "async";
        img.src = urlFunction(i);
        
        img.onload = () => {
          if (!isMounted) return;
          loadedCount++;
          // Only update React state occasionally to prevent render thrashing
          if (loadedCount % 5 === 0 || loadedCount === frameCount) {
              setImagesLoaded(loadedCount);
          }
        };
        img.onerror = () => {
          if (!isMounted) return;
          loadedCount++;
        };
        
        imagesRef.current[i] = img;
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [frameCount, urlFunction]);

  const { scrollYProgress } = useScroll();

  // Whenever the scroll progresses, we draw the corresponding frame onto the canvas
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!canvasRef.current || imagesRef.current[0] === null) return;

    // Map [0, 1] to [0, frameCount - 1]
    const targetFrameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(latest * frameCount))
    );

    // Fallback logic: If the target frame hasn't finished loading yet,
    // gracefully render the closest available earlier frame
    let frameIndexToDraw = targetFrameIndex;
    let img = imagesRef.current[frameIndexToDraw];

    while (frameIndexToDraw >= 0 && (!img || !img.complete || img.naturalWidth === 0)) {
        frameIndexToDraw--;
        img = imagesRef.current[frameIndexToDraw];
    }

    // Nothing available yet
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Clear and draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate aspect ratio to cover the canvas (object-fit: cover logic)
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }
  });

  // Calculate loading progress text opacity (fades out when the first image is ready)
  const loadingOpacity = useMemo(() => {
    if (imagesLoaded >= 1) return 0; // Hide spinner almost instantly!
    return 1;
  }, [imagesLoaded]);

  return (
    <div className={`fixed inset-0 w-full h-[100vh] -z-50 pointer-events-none bg-background ${className}`}>
      <div className="w-full h-full overflow-hidden flex items-center justify-center relative">
        
        {/* Loading Indicator */}
        <div 
          className="absolute z-20 flex flex-col items-center gap-4 transition-opacity duration-500"
          style={{ opacity: loadingOpacity }}
        >
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>

        {/* The Canvas that renders the frames */}
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="w-full h-full object-cover z-10 opacity-70"
        />

        {/* Overlay / Gradient to ensure content is readable over the animation */}
        <div className="absolute inset-0 bg-background/60 z-10" />

      </div>
    </div>
  );
};

export default ScrollSequence;
