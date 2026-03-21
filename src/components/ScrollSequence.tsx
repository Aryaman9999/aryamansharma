import { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

interface ScrollSequenceProps {
  frameCount: number;
  urlFunction: (frame: number) => string;
  className?: string;
}

const ScrollSequence = ({ frameCount, urlFunction, className = "" }: ScrollSequenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  // Preload all images logic
  useEffect(() => {
    let isMounted = true;
    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    const loadImages = async () => {
      // Pre-allocate array
      for (let i = 0; i < frameCount; i++) {
        loadedImages.push(new Image());
      }

      for (let i = 0; i < frameCount; i++) {
        if (!isMounted) return;
        
        const img = new Image();
        img.src = urlFunction(i);
        
        await new Promise((resolve) => {
          img.onload = () => {
            loadedCount++;
            setImagesLoaded(loadedCount);
            resolve(null);
          };
          img.onerror = () => {
            // Handle error, maybe fallback
            loadedCount++;
            setImagesLoaded(loadedCount);
            resolve(null);
          };
        });
        
        loadedImages[i] = img;
      }
      
      if (isMounted) {
        setImages(loadedImages);
        // Draw first frame immediately once the first image is loaded
        if (loadedImages[0] && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(loadedImages[0], 0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
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
    if (images.length === 0 || !canvasRef.current) return;

    // Map [0, 1] to [0, frameCount - 1]
    const frameIndex = Math.min(
      frameCount - 1,
      Math.max(0, Math.floor(latest * frameCount))
    );

    const img = images[frameIndex];
    if (img && img.complete) {
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
    }
  });

  // Calculate loading progress text opacity (fades out when nearly done)
  const loadingOpacity = useMemo(() => {
    if (imagesLoaded >= frameCount * 0.9) return 0;
    return 1;
  }, [imagesLoaded, frameCount]);

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
