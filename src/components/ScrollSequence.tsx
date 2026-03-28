import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

interface ScrollSequenceProps {
  frameCount: number;
  urlFunction: (frame: number) => string;
  className?: string;
}

// Adaptive canvas dimensions based on screen size
const getCanvasDimensions = () => {
  const dpr = Math.min(window.devicePixelRatio, 1.5);
  const w = window.innerWidth;

  // Scale canvas resolution to actual screen, capped at 1920x1080
  if (w <= 768) return { width: Math.round(640 * dpr), height: Math.round(360 * dpr) };
  if (w <= 1280) return { width: Math.round(1280 * dpr), height: Math.round(720 * dpr) };
  return { width: Math.round(Math.min(w, 1920) * dpr), height: Math.round(Math.min(w * 9 / 16, 1080) * dpr) };
};

const ScrollSequence = ({ frameCount, urlFunction, className = "" }: ScrollSequenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(frameCount).fill(null));
  const loadingRef = useRef<Set<number>>(new Set()); // tracks in-flight requests
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const lastDrawnFrame = useRef(-1);
  const rafId = useRef<number | null>(null);
  const currentFrameIndex = useRef(0);
  const [canvasDims] = useState(getCanvasDimensions);

  // Load a single frame, returns a promise
  const loadFrame = useCallback((index: number): Promise<void> => {
    if (imagesRef.current[index]?.complete || loadingRef.current.has(index)) {
      return Promise.resolve();
    }
    loadingRef.current.add(index);

    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.src = urlFunction(index);
      img.onload = () => {
        imagesRef.current[index] = img;
        loadingRef.current.delete(index);
        resolve();
      };
      img.onerror = () => {
        loadingRef.current.delete(index);
        resolve();
      };
      // Store reference even before load completes (for the ref array)
      imagesRef.current[index] = img;
    });
  }, [urlFunction]);

  // Load frames near a given index (priority window)
  const loadNearbyFrames = useCallback((centerIndex: number) => {
    const AHEAD = 8;  // pre-fetch 8 frames ahead
    const BEHIND = 3; // keep 3 frames behind

    for (let offset = 0; offset <= AHEAD; offset++) {
      const idx = centerIndex + offset;
      if (idx < frameCount) loadFrame(idx);
    }
    for (let offset = 1; offset <= BEHIND; offset++) {
      const idx = centerIndex - offset;
      if (idx >= 0) loadFrame(idx);
    }
  }, [frameCount, loadFrame]);

  // Initial load: first frame immediately, then a small batch
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      // 1. Load first frame and draw it immediately
      await loadFrame(0);
      if (!isMounted) return;
      setFirstFrameReady(true);
      drawFrame(0);

      // 2. Pre-fetch first ~12 frames for smooth initial scrolling
      for (let i = 1; i < Math.min(12, frameCount); i++) {
        loadFrame(i);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [frameCount, loadFrame]);

  // Draw a specific frame onto the canvas
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Find the best available frame (target or nearest earlier loaded frame)
    let idx = frameIndex;
    let img = imagesRef.current[idx];
    while (idx >= 0 && (!img || !img.complete || img.naturalWidth === 0)) {
      idx--;
      img = idx >= 0 ? imagesRef.current[idx] : null;
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;
    if (idx === lastDrawnFrame.current) return; // skip redundant draws

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    lastDrawnFrame.current = idx;

    // Cover-fit calculation
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }, []);

  // rAF-throttled draw scheduler
  const scheduleDrawAndPrefetch = useCallback((frameIndex: number) => {
    currentFrameIndex.current = frameIndex;

    if (rafId.current !== null) return; // already scheduled

    rafId.current = requestAnimationFrame(() => {
      rafId.current = null;
      const idx = currentFrameIndex.current;
      drawFrame(idx);
      loadNearbyFrames(idx);
    });
  }, [drawFrame, loadNearbyFrames]);

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const { scrollYProgress } = useScroll();

  // On scroll, compute target frame and schedule a draw
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!canvasRef.current) return;

    const targetFrameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(latest * frameCount))
    );

    scheduleDrawAndPrefetch(targetFrameIndex);
  });

  // Loading opacity: hide spinner once first frame is ready
  const loadingOpacity = firstFrameReady ? 0 : 1;

  return (
    <div className={`fixed inset-0 w-full h-[100vh] -z-50 pointer-events-none bg-background ${className}`}
      style={{ willChange: 'transform' }}
    >
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
          width={canvasDims.width}
          height={canvasDims.height}
          className="w-full h-full object-cover z-10 opacity-70"
        />

        {/* Overlay / Gradient to ensure content is readable over the animation */}
        <div className="absolute inset-0 bg-background/60 z-10" />

      </div>
    </div>
  );
};

export default ScrollSequence;
