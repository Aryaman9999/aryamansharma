import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { SiliconChip } from './SiliconChip';
import { BackgroundGrid } from './BackgroundGrid';

interface SceneProps {
    showChip?: boolean;
    isHero?: boolean;
}

// Main scene content
const SceneContent = ({ showChip = true }: SceneProps) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1
            });
        };

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />

            {/* Background elements */}
            <BackgroundGrid scrollY={scrollY} />

            {/* Main silicon chip */}
            {showChip && (
                <group position={[0, 0, 0]}>
                    <SiliconChip mousePosition={mousePosition} />
                </group>
            )}

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
            <pointLight position={[-5, 5, -5]} intensity={0.5} color="#6366f1" />
            <pointLight position={[5, -5, 5]} intensity={0.3} color="#06b6d4" />
        </>
    );
};

// Background-only scene for full-page background
const BackgroundSceneContent = () => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
            <BackgroundGrid scrollY={scrollY} />
            <ambientLight intensity={0.2} />
        </>
    );
};

// Hero Scene with the silicon chip
export const HeroScene = () => {
    return (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            <Canvas
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <SceneContent showChip={true} isHero={true} />
                </Suspense>
            </Canvas>
        </div>
    );
};

// Full-page background scene
export const BackgroundScene = () => {
    return (
        <div
            className="fixed inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: -1 }}
        >
            <Canvas
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance'
                }}
                style={{ background: 'transparent' }}
            >
                <Suspense fallback={null}>
                    <BackgroundSceneContent />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default HeroScene;
