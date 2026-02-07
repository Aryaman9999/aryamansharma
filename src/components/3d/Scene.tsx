import { Suspense, useEffect, useState, useCallback, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { SiliconChip } from './SiliconChip';
import { BackgroundGrid } from './BackgroundGrid';

interface SceneProps {
    showChip?: boolean;
    isHero?: boolean;
}

// Throttle function to limit updates
const throttle = <T extends (...args: any[]) => void>(func: T, limit: number) => {
    let lastFunc: ReturnType<typeof setTimeout>;
    let lastRan: number;
    return (...args: Parameters<T>) => {
        if (!lastRan) {
            func(...args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= limit) {
                    func(...args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};

// Main scene content - optimized with throttled updates
const SceneContent = memo(({ showChip = true }: SceneProps) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        // Throttle mouse updates to 30fps
        const handleMouseMove = throttle((e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            });
        }, 33);

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />

            {/* Background elements */}
            <BackgroundGrid />

            {/* Main silicon chip */}
            {showChip && (
                <group position={[0, 0, 0]}>
                    <SiliconChip mousePosition={mousePosition} />
                </group>
            )}

            {/* Simplified lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
            <pointLight position={[-5, 5, -5]} intensity={0.4} color="#6366f1" />
        </>
    );
});

SceneContent.displayName = 'SceneContent';

// Background-only scene - simplified, no scroll tracking
const BackgroundSceneContent = memo(() => {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
            <BackgroundGrid />
            <ambientLight intensity={0.15} />
        </>
    );
});

BackgroundSceneContent.displayName = 'BackgroundSceneContent';

// Hero Scene with the silicon chip
export const HeroScene = memo(() => {
    return (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <Canvas
                gl={{
                    antialias: false, // Disable for performance
                    alpha: true,
                    powerPreference: 'high-performance',
                    failIfMajorPerformanceCaveat: true, // Don't render on very weak GPUs
                }}
                dpr={[1, 1.5]} // Limit pixel ratio for performance
                frameloop="demand" // Only render when needed
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <SceneContent showChip={true} isHero={true} />
                </Suspense>
            </Canvas>
        </div>
    );
});

HeroScene.displayName = 'HeroScene';

// Full-page background scene - heavily optimized
export const BackgroundScene = memo(() => {
    return (
        <div
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: -1 }}
        >
            <Canvas
                gl={{
                    antialias: false, // Disable for performance
                    alpha: true,
                    powerPreference: 'high-performance',
                    failIfMajorPerformanceCaveat: true,
                }}
                dpr={[1, 1.5]} // Limit pixel ratio
                frameloop="always" // Background needs continuous updates for particles
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <BackgroundSceneContent />
                </Suspense>
            </Canvas>
        </div>
    );
});

BackgroundScene.displayName = 'BackgroundScene';

export default HeroScene;
