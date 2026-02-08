import { Suspense, useEffect, useState, memo, useRef, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
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

// Performance limiter - caps frame rate when not in focus
const PerformanceLimiter = memo(() => {
    const { invalidate, clock } = useThree();
    const isVisible = useRef(true);
    const lastFrame = useRef(0);
    const targetFPS = 30; // Target 30 FPS for background 3D
    const frameInterval = 1000 / targetFPS;

    useEffect(() => {
        const handleVisibilityChange = () => {
            isVisible.current = document.visibilityState === 'visible';
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useFrame(() => {
        if (!isVisible.current) return;
        const now = performance.now();
        if (now - lastFrame.current < frameInterval) return;
        lastFrame.current = now;
    });

    return null;
});

PerformanceLimiter.displayName = 'PerformanceLimiter';

// Hook to detect current theme
const useTheme = () => {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const checkTheme = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        checkTheme();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    checkTheme();
                }
            });
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    return isDark;
};

// Main scene content - optimized with throttled updates
const SceneContent = memo(({ showChip = true }: SceneProps) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const isDark = useTheme();

    useEffect(() => {
        // Throttle mouse updates to 20fps for smoother interpolation
        const handleMouseMove = throttle((e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            });
        }, 50);

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    // Lighting intensity based on theme - brighter in dark mode
    const ambientIntensity = isDark ? 0.6 : 0.35;
    const directionalIntensity = isDark ? 0.9 : 0.5;
    const pointIntensity = isDark ? 0.6 : 0.3;

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

            {/* Theme-aware lighting - brighter in dark mode */}
            <ambientLight intensity={ambientIntensity} />
            <directionalLight position={[5, 5, 5]} intensity={directionalIntensity} color="#ffffff" />
            <pointLight position={[-5, 5, -5]} intensity={pointIntensity} color="#6366f1" distance={30} />
            {/* Extra fill light for dark mode */}
            {isDark && (
                <>
                    <pointLight position={[0, 3, 3]} intensity={0.4} color="#a5b4fc" distance={20} />
                    <directionalLight position={[-3, 2, 0]} intensity={0.3} color="#c4b5fd" />
                </>
            )}

            <PerformanceLimiter />
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
            <ambientLight intensity={0.12} />
            <PerformanceLimiter />
        </>
    );
});

BackgroundSceneContent.displayName = 'BackgroundSceneContent';

// Check if WebGL is supported and has good performance
const useWebGLCapability = () => {
    const [canRender3D, setCanRender3D] = useState<boolean | null>(null);

    useEffect(() => {
        // Quick GPU capability check
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

        if (!gl) {
            setCanRender3D(false);
            return;
        }

        // Check for software renderer (usually slow)
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            const isSoftware = renderer.toLowerCase().includes('swiftshader') ||
                renderer.toLowerCase().includes('llvmpipe') ||
                renderer.toLowerCase().includes('software');

            if (isSoftware) {
                setCanRender3D(false);
                return;
            }
        }

        // Check max texture size (proxy for GPU power)
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        if (maxTextureSize < 4096) {
            setCanRender3D(false);
            return;
        }

        setCanRender3D(true);
    }, []);

    return canRender3D;
};

// Hero Scene with the silicon chip - with context loss handling and GPU detection
export const HeroScene = memo(() => {
    const [contextLost, setContextLost] = useState(false);
    const canRender3D = useWebGLCapability();

    // Handle WebGL context loss/restore
    const onCreated = useCallback(({ gl }: { gl: THREE.WebGLRenderer }) => {
        const canvas = gl.domElement;

        const handleContextLost = (event: Event) => {
            event.preventDefault();
            console.warn('WebGL context lost, showing fallback');
            setContextLost(true);
        };

        const handleContextRestored = () => {
            console.log('WebGL context restored');
            setContextLost(false);
        };

        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);
    }, []);

    // Show fallback gradient if:
    // - GPU capability check failed
    // - GPU capability is still loading (null)
    // - Context was lost
    if (canRender3D === false || contextLost) {
        return (
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    zIndex: 0,
                    background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%)'
                }}
            />
        );
    }

    // Still checking GPU capability
    if (canRender3D === null) {
        return null;
    }

    return (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <Canvas
                gl={{
                    antialias: false,
                    alpha: true,
                    powerPreference: 'high-performance',
                    failIfMajorPerformanceCaveat: false,
                    stencil: false,
                    depth: true,
                    preserveDrawingBuffer: false,
                }}
                dpr={Math.min(window.devicePixelRatio, 1.5)}
                frameloop="always"
                performance={{ min: 0.5 }}
                style={{ background: 'transparent' }}
                onCreated={onCreated}
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
                    antialias: false,
                    alpha: true,
                    powerPreference: 'high-performance',
                    failIfMajorPerformanceCaveat: true,
                    stencil: false,
                    depth: false,
                }}
                dpr={1} // Fixed DPR for background
                frameloop="always"
                performance={{ min: 0.3 }}
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

