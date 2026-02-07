import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// Chip pin component
const ChipPin = ({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
    return (
        <group position={position} rotation={rotation as any}>
            <mesh>
                <boxGeometry args={[0.08, 0.02, 0.25]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    );
};

// Animated data pulse that travels along traces
const DataPulse = ({ pathPoints, speed = 1 }: { pathPoints: THREE.Vector3[], speed?: number }) => {
    const pulseRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (!pulseRef.current) return;
        const t = (clock.getElapsedTime() * speed) % 1;
        const index = Math.floor(t * (pathPoints.length - 1));
        const nextIndex = Math.min(index + 1, pathPoints.length - 1);
        const localT = (t * (pathPoints.length - 1)) % 1;

        const pos = new THREE.Vector3().lerpVectors(pathPoints[index], pathPoints[nextIndex], localT);
        pulseRef.current.position.copy(pos);
    });

    return (
        <mesh ref={pulseRef}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#00ffff" />
        </mesh>
    );
};

interface SiliconChipProps {
    mousePosition: { x: number; y: number };
}

export const SiliconChip = ({ mousePosition }: SiliconChipProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const coreRef = useRef<THREE.Mesh>(null);

    // Animated rotation based on mouse position
    const { rotation } = useSpring({
        rotation: [
            mousePosition.y * 0.3,
            mousePosition.x * 0.3,
            0
        ],
        config: { mass: 1, tension: 170, friction: 26 }
    });

    useFrame(({ clock }) => {
        if (groupRef.current) {
            // Gentle floating animation
            groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.1;

            // Subtle rotation
            groupRef.current.rotation.y += 0.001;
        }

        if (glowRef.current) {
            // Pulsing glow
            const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
            glowRef.current.scale.setScalar(scale);
        }

        if (coreRef.current && coreRef.current.material) {
            // Core pulsing
            (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.3;
        }
    });

    // Generate circuit traces (just store positions, render as spheres for simplicity)
    const circuitTraces = useMemo(() => {
        const traces: THREE.Vector3[][] = [];

        // Horizontal traces
        for (let i = 0; i < 5; i++) {
            const y = 0.301;
            const z = -0.6 + i * 0.3;
            traces.push([
                new THREE.Vector3(-0.8, y, z),
                new THREE.Vector3(-0.3, y, z),
                new THREE.Vector3(-0.2, y, z + 0.1),
                new THREE.Vector3(0.2, y, z + 0.1),
                new THREE.Vector3(0.3, y, z),
                new THREE.Vector3(0.8, y, z),
            ]);
        }

        return traces;
    }, []);

    // Generate pins
    const pins = useMemo(() => {
        const pinPositions: { position: [number, number, number], rotation: [number, number, number] }[] = [];

        // Left side pins
        for (let i = 0; i < 6; i++) {
            pinPositions.push({
                position: [-1.1, 0.1, -0.5 + i * 0.2],
                rotation: [0, 0, 0]
            });
        }

        // Right side pins
        for (let i = 0; i < 6; i++) {
            pinPositions.push({
                position: [1.1, 0.1, -0.5 + i * 0.2],
                rotation: [0, 0, 0]
            });
        }

        // Top pins
        for (let i = 0; i < 6; i++) {
            pinPositions.push({
                position: [-0.5 + i * 0.2, 0.1, -1.1],
                rotation: [0, Math.PI / 2, 0]
            });
        }

        // Bottom pins
        for (let i = 0; i < 6; i++) {
            pinPositions.push({
                position: [-0.5 + i * 0.2, 0.1, 1.1],
                rotation: [0, Math.PI / 2, 0]
            });
        }

        return pinPositions;
    }, []);

    // Neural nodes for the "AI brain" aspect
    const neuralNodes = useMemo(() => {
        const nodes: THREE.Vector3[] = [];
        for (let i = 0; i < 12; i++) {
            nodes.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.8,
                0.35,
                (Math.random() - 0.5) * 0.8
            ));
        }
        return nodes;
    }, []);

    return (
        <animated.group ref={groupRef} rotation={rotation as any} scale={1.5}>
            {/* Main chip body - dark substrate */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 0.3, 2]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    metalness={0.7}
                    roughness={0.3}
                />
            </mesh>

            {/* Edge highlight */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.01, 0.31, 2.01]} />
                <meshBasicMaterial color="#303050" wireframe />
            </mesh>

            {/* Die (silicon core) - brighter area */}
            <mesh ref={coreRef} position={[0, 0.16, 0]}>
                <boxGeometry args={[1.4, 0.02, 1.4]} />
                <meshStandardMaterial
                    color="#2d2d44"
                    metalness={0.5}
                    roughness={0.4}
                    emissive="#6366f1"
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Circuit trace nodes (dots instead of lines for simplicity) */}
            {circuitTraces.flat().map((pos, i) => (
                <mesh key={`trace-node-${i}`} position={pos}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#06b6d4" : "#8b5cf6"} />
                </mesh>
            ))}

            {/* Data pulses */}
            {circuitTraces.slice(0, 3).map((points, i) => (
                <DataPulse key={`pulse-${i}`} pathPoints={points} speed={0.3 + i * 0.1} />
            ))}

            {/* Neural nodes */}
            {neuralNodes.map((pos, i) => (
                <mesh key={`node-${i}`} position={pos}>
                    <sphereGeometry args={[0.04, 16, 16]} />
                    <meshStandardMaterial
                        color="#8b5cf6"
                        emissive="#8b5cf6"
                        emissiveIntensity={0.8}
                    />
                </mesh>
            ))}

            {/* Pins */}
            {pins.map((pin, i) => (
                <ChipPin key={`pin-${i}`} position={pin.position} rotation={pin.rotation} />
            ))}

            {/* Glow effect */}
            <mesh ref={glowRef} position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[3, 3]} />
                <meshBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.15}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Corner markers */}
            {[[-1, 0.16, -1], [1, 0.16, -1], [-1, 0.16, 1], [1, 0.16, 1]].map((pos, i) => (
                <mesh key={`corner-${i}`} position={pos as [number, number, number]}>
                    <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
                    <meshStandardMaterial color="#f0f0f0" metalness={0.9} roughness={0.1} />
                </mesh>
            ))}

            {/* Text label area (simulated) */}
            <mesh position={[0.4, 0.301, -0.5]}>
                <planeGeometry args={[0.5, 0.15]} />
                <meshBasicMaterial color="#404060" transparent opacity={0.8} />
            </mesh>
        </animated.group>
    );
};

export default SiliconChip;
