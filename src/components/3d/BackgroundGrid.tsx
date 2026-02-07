import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BackgroundGridProps {
    scrollY?: number;
}

// Flowing particles representing data streams
const DataParticles = () => {
    const particlesRef = useRef<THREE.Points>(null);
    const count = 200;

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
                size={0.05}
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
};

// Grid plane that warps slightly
const WarpGrid = ({ scrollY = 0 }: { scrollY?: number }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (meshRef.current) {
            meshRef.current.position.y = -5 + scrollY * 0.001;
            meshRef.current.rotation.x = -Math.PI / 2 + Math.sin(clock.getElapsedTime() * 0.1) * 0.02;
        }
    });

    return (
        <group>
            <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
                <planeGeometry args={[60, 60, 60, 60]} />
                <meshBasicMaterial
                    color="#0a0a15"
                    wireframe
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Glowing horizon line */}
            <mesh position={[0, -5, -25]} rotation={[0, 0, 0]}>
                <planeGeometry args={[100, 0.5]} />
                <meshBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.5}
                />
            </mesh>
        </group>
    );
};

// Circuit nodes in the background (simplified from lines)
const CircuitNodes = () => {
    const nodes = useMemo(() => {
        const nodeData: { position: [number, number, number], color: string }[] = [];

        for (let i = 0; i < 50; i++) {
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 20;
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
                    <sphereGeometry args={[0.05, 8, 8]} />
                    <meshBasicMaterial color={node.color} transparent opacity={0.4} />
                </mesh>
            ))}
        </group>
    );
};

// Ambient fog/mist effect particles
const DataFog = () => {
    const fogRef = useRef<THREE.Points>(null);
    const count = 100;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 50;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
            pos[i * 3 + 2] = -10 - Math.random() * 10;
        }
        return pos;
    }, []);

    useFrame(({ clock }) => {
        if (fogRef.current) {
            fogRef.current.rotation.y = clock.getElapsedTime() * 0.01;
        }
    });

    return (
        <points ref={fogRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                color="#1e1b4b"
                size={1}
                transparent
                opacity={0.3}
                sizeAttenuation
            />
        </points>
    );
};

export const BackgroundGrid = ({ scrollY = 0 }: BackgroundGridProps) => {
    return (
        <group>
            <WarpGrid scrollY={scrollY} />
            <DataParticles />
            <CircuitNodes />
            <DataFog />

            {/* Ambient lighting */}
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 5]} intensity={0.5} color="#6366f1" />
            <pointLight position={[-10, -10, 5]} intensity={0.3} color="#06b6d4" />
        </group>
    );
};

export default BackgroundGrid;
