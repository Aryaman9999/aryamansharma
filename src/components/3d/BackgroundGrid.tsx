import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BackgroundGridProps {
    scrollY?: number;
}

// Optimized flowing particles - reduced count, throttled updates
const DataParticles = memo(() => {
    const particlesRef = useRef<THREE.Points>(null);
    const count = 80; // Reduced from 200
    const frameSkip = useRef(0);

    const [positions, velocities] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vel = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 30;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;

            vel[i * 3] = (Math.random() - 0.5) * 0.02;
            vel[i * 3 + 1] = -Math.random() * 0.02 - 0.01;
            vel[i * 3 + 2] = 0;
        }

        return [pos, vel];
    }, []);

    useFrame(() => {
        // Skip every other frame for performance
        frameSkip.current++;
        if (frameSkip.current % 2 !== 0) return;
        if (!particlesRef.current) return;

        const posAttr = particlesRef.current.geometry.attributes.position;
        const posArray = posAttr.array as Float32Array;

        for (let i = 0; i < count; i++) {
            posArray[i * 3] += velocities[i * 3];
            posArray[i * 3 + 1] += velocities[i * 3 + 1];

            // Reset particles that fall below
            if (posArray[i * 3 + 1] < -15) {
                posArray[i * 3] = (Math.random() - 0.5) * 30;
                posArray[i * 3 + 1] = 15;
            }
        }

        posAttr.needsUpdate = true;
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#6366f1"
                size={0.06}
                transparent
                opacity={0.5}
                sizeAttenuation
            />
        </points>
    );
});

DataParticles.displayName = 'DataParticles';

// Simplified static grid - no animation
const StaticGrid = memo(() => {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
                <planeGeometry args={[50, 50, 30, 30]} />
                <meshBasicMaterial
                    color="#0a0a15"
                    wireframe
                    transparent
                    opacity={0.25}
                />
            </mesh>

            {/* Glowing horizon line */}
            <mesh position={[0, -5, -20]} rotation={[0, 0, 0]}>
                <planeGeometry args={[80, 0.3]} />
                <meshBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.4}
                />
            </mesh>
        </group>
    );
});

StaticGrid.displayName = 'StaticGrid';

// Static circuit nodes - no animation
const StaticNodes = memo(() => {
    const nodes = useMemo(() => {
        const nodeData: { position: [number, number, number], color: string }[] = [];

        for (let i = 0; i < 25; i++) { // Reduced from 50
            const x = (Math.random() - 0.5) * 35;
            const y = (Math.random() - 0.5) * 15;
            const z = -8 - Math.random() * 5;

            nodeData.push({
                position: [x, y, z],
                color: Math.random() > 0.5 ? '#06b6d4' : '#8b5cf6'
            });
        }

        return nodeData;
    }, []);

    return (
        <group>
            {nodes.map((node, i) => (
                <mesh key={i} position={node.position}>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshBasicMaterial color={node.color} transparent opacity={0.35} />
                </mesh>
            ))}
        </group>
    );
});

StaticNodes.displayName = 'StaticNodes';

export const BackgroundGrid = memo(({ scrollY = 0 }: BackgroundGridProps) => {
    return (
        <group>
            <StaticGrid />
            <DataParticles />
            <StaticNodes />

            {/* Simplified lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[10, 10, 5]} intensity={0.4} color="#6366f1" />
        </group>
    );
});

BackgroundGrid.displayName = 'BackgroundGrid';

export default BackgroundGrid;
