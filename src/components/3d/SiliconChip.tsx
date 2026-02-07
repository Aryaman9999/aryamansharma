import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// Optimized chip pin - memoized
const ChipPin = memo(({ position, rotation = [0, 0, 0] }: { position: [number, number, number], rotation?: [number, number, number] }) => {
    return (
        <group position={position} rotation={rotation as any}>
            <mesh>
                <boxGeometry args={[0.08, 0.02, 0.25]} />
                <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.2} />
            </mesh>
        </group>
    );
});

ChipPin.displayName = 'ChipPin';

// Simplified data pulse - reduced update frequency
const DataPulse = memo(({ pathPoints, speed = 1 }: { pathPoints: THREE.Vector3[], speed?: number }) => {
    const pulseRef = useRef<THREE.Mesh>(null);
    const frameSkip = useRef(0);

    useFrame(({ clock }) => {
        // Skip frames for performance
        frameSkip.current++;
        if (frameSkip.current % 3 !== 0) return;
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
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshBasicMaterial color="#00ffff" />
        </mesh>
    );
});

DataPulse.displayName = 'DataPulse';

interface SiliconChipProps {
    mousePosition: { x: number; y: number };
}

export const SiliconChip = memo(({ mousePosition }: SiliconChipProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const frameSkip = useRef(0);

    // Animated rotation based on mouse position - reduced spring tension
    const { rotation } = useSpring({
        rotation: [
            mousePosition.y * 0.25,
            mousePosition.x * 0.25,
            0
        ],
        config: { mass: 2, tension: 120, friction: 30 }
    });

    useFrame(({ clock }) => {
        // Skip every other frame
        frameSkip.current++;
        if (frameSkip.current % 2 !== 0) return;

        if (groupRef.current) {
            // Gentle floating animation
            groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08;
            groupRef.current.rotation.y += 0.0008;
        }

        if (glowRef.current) {
            const scale = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.03;
            glowRef.current.scale.setScalar(scale);
        }

        if (coreRef.current && coreRef.current.material) {
            (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
        }
    });

    // Simplified circuit traces - fewer points
    const circuitTraces = useMemo(() => {
        const traces: THREE.Vector3[][] = [];

        // Only 3 horizontal traces instead of 5
        for (let i = 0; i < 3; i++) {
            const y = 0.301;
            const z = -0.4 + i * 0.4;
            traces.push([
                new THREE.Vector3(-0.7, y, z),
                new THREE.Vector3(0, y, z),
                new THREE.Vector3(0.7, y, z),
            ]);
        }

        return traces;
    }, []);

    // Reduced number of pins
    const pins = useMemo(() => {
        const pinPositions: { position: [number, number, number], rotation: [number, number, number] }[] = [];

        // Only 4 pins per side instead of 6
        for (let i = 0; i < 4; i++) {
            pinPositions.push({ position: [-1.1, 0.1, -0.3 + i * 0.2], rotation: [0, 0, 0] });
            pinPositions.push({ position: [1.1, 0.1, -0.3 + i * 0.2], rotation: [0, 0, 0] });
            pinPositions.push({ position: [-0.3 + i * 0.2, 0.1, -1.1], rotation: [0, Math.PI / 2, 0] });
            pinPositions.push({ position: [-0.3 + i * 0.2, 0.1, 1.1], rotation: [0, Math.PI / 2, 0] });
        }

        return pinPositions;
    }, []);

    // Reduced neural nodes
    const neuralNodes = useMemo(() => {
        const nodes: THREE.Vector3[] = [];
        for (let i = 0; i < 8; i++) { // Reduced from 12
            nodes.push(new THREE.Vector3(
                (Math.random() - 0.5) * 0.7,
                0.35,
                (Math.random() - 0.5) * 0.7
            ));
        }
        return nodes;
    }, []);

    return (
        <animated.group ref={groupRef} rotation={rotation as any} scale={1.5}>
            {/* Main chip body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2, 0.3, 2]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    metalness={0.7}
                    roughness={0.3}
                />
            </mesh>

            {/* Die (silicon core) */}
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

            {/* Simplified trace nodes */}
            {circuitTraces.flat().map((pos, i) => (
                <mesh key={`trace-${i}`} position={pos}>
                    <sphereGeometry args={[0.025, 6, 6]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#06b6d4" : "#8b5cf6"} />
                </mesh>
            ))}

            {/* Data pulses - only 2 */}
            {circuitTraces.slice(0, 2).map((points, i) => (
                <DataPulse key={`pulse-${i}`} pathPoints={points} speed={0.25 + i * 0.1} />
            ))}

            {/* Neural nodes - simplified geometry */}
            {neuralNodes.map((pos, i) => (
                <mesh key={`node-${i}`} position={pos}>
                    <sphereGeometry args={[0.035, 8, 8]} />
                    <meshBasicMaterial color="#8b5cf6" />
                </mesh>
            ))}

            {/* Pins */}
            {pins.map((pin, i) => (
                <ChipPin key={`pin-${i}`} position={pin.position} rotation={pin.rotation} />
            ))}

            {/* Glow effect */}
            <mesh ref={glowRef} position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.5, 2.5]} />
                <meshBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </animated.group>
    );
});

SiliconChip.displayName = 'SiliconChip';

export default SiliconChip;
