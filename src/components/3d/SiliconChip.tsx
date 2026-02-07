import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

// Enhanced IC Pin with lead frame style
const ICPin = memo(({ position, rotation = [0, 0, 0], side }: {
    position: [number, number, number],
    rotation?: [number, number, number],
    side: 'left' | 'right' | 'top' | 'bottom'
}) => {
    const isHorizontal = side === 'left' || side === 'right';

    return (
        <group position={position} rotation={rotation as any}>
            {/* Pin leg - bent lead frame style */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={isHorizontal ? [0.35, 0.03, 0.06] : [0.06, 0.03, 0.35]} />
                <meshStandardMaterial
                    color="#d4d4d4"
                    metalness={0.95}
                    roughness={0.1}
                />
            </mesh>
            {/* Pin tip - soldering point */}
            <mesh position={isHorizontal ? (side === 'left' ? [-0.15, -0.02, 0] : [0.15, -0.02, 0]) : (side === 'top' ? [0, -0.02, -0.15] : [0, -0.02, 0.15])}>
                <boxGeometry args={[0.08, 0.04, 0.08]} />
                <meshStandardMaterial
                    color="#c0c0c0"
                    metalness={0.9}
                    roughness={0.15}
                />
            </mesh>
        </group>
    );
});

ICPin.displayName = 'ICPin';

// Glowing electron pulse that travels along circuit traces
const ElectronPulse = memo(({ pathPoints, speed = 1, color = "#00ffff", size = 0.04 }: {
    pathPoints: THREE.Vector3[],
    speed?: number,
    color?: string,
    size?: number
}) => {
    const pulseRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (!pulseRef.current) return;

        const t = (clock.getElapsedTime() * speed) % 1;
        const index = Math.floor(t * (pathPoints.length - 1));
        const nextIndex = Math.min(index + 1, pathPoints.length - 1);
        const localT = (t * (pathPoints.length - 1)) % 1;

        const pos = new THREE.Vector3().lerpVectors(pathPoints[index], pathPoints[nextIndex], localT);
        pulseRef.current.position.copy(pos);

        if (glowRef.current) {
            glowRef.current.position.copy(pos);
            // Pulsing glow
            const scale = 1 + Math.sin(clock.getElapsedTime() * 10) * 0.3;
            glowRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group>
            {/* Core electron */}
            <mesh ref={pulseRef}>
                <sphereGeometry args={[size, 12, 12]} />
                <meshBasicMaterial color={color} />
            </mesh>
            {/* Glow effect */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[size * 2, 8, 8]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
        </group>
    );
});

ElectronPulse.displayName = 'ElectronPulse';

// Circuit trace line with glow
const CircuitTrace = memo(({ start, end, color = "#06b6d4" }: {
    start: [number, number, number],
    end: [number, number, number],
    color?: string
}) => {
    const mid = useMemo(() => {
        return [
            (start[0] + end[0]) / 2,
            (start[1] + end[1]) / 2,
            (start[2] + end[2]) / 2
        ] as [number, number, number];
    }, [start, end]);

    const length = useMemo(() => {
        return Math.sqrt(
            Math.pow(end[0] - start[0], 2) +
            Math.pow(end[1] - start[1], 2) +
            Math.pow(end[2] - start[2], 2)
        );
    }, [start, end]);

    const rotation = useMemo(() => {
        const dir = new THREE.Vector3(end[0] - start[0], end[1] - start[1], end[2] - start[2]).normalize();
        if (Math.abs(dir.x) > 0.9) return [0, 0, Math.PI / 2];
        return [0, 0, 0];
    }, [start, end]);

    return (
        <mesh position={mid} rotation={rotation as any}>
            <boxGeometry args={[length, 0.008, 0.015]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
        </mesh>
    );
});

CircuitTrace.displayName = 'CircuitTrace';

interface SiliconChipProps {
    mousePosition: { x: number; y: number };
}

export const SiliconChip = memo(({ mousePosition }: SiliconChipProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const frameCount = useRef(0);

    // Smoother rotation based on mouse
    const { rotation } = useSpring({
        rotation: [
            mousePosition.y * 0.2,
            mousePosition.x * 0.25,
            0
        ],
        config: { mass: 2, tension: 100, friction: 25 }
    });

    useFrame(({ clock }) => {
        frameCount.current++;
        if (frameCount.current % 2 !== 0) return;

        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.08;
            groupRef.current.rotation.y += 0.0005;
        }

        if (coreRef.current && coreRef.current.material) {
            (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                0.4 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
        }
    });

    // Generate pins for all 4 sides
    const pins = useMemo(() => {
        const pinData: { position: [number, number, number], side: 'left' | 'right' | 'top' | 'bottom' }[] = [];
        const pinCount = 8;
        const spacing = 1.4 / (pinCount - 1);
        const startOffset = -0.7;

        // Left side
        for (let i = 0; i < pinCount; i++) {
            pinData.push({ position: [-1.15, 0.05, startOffset + i * spacing], side: 'left' });
        }
        // Right side
        for (let i = 0; i < pinCount; i++) {
            pinData.push({ position: [1.15, 0.05, startOffset + i * spacing], side: 'right' });
        }
        // Top side
        for (let i = 0; i < pinCount; i++) {
            pinData.push({ position: [startOffset + i * spacing, 0.05, -1.15], side: 'top' });
        }
        // Bottom side
        for (let i = 0; i < pinCount; i++) {
            pinData.push({ position: [startOffset + i * spacing, 0.05, 1.15], side: 'bottom' });
        }

        return pinData;
    }, []);

    // Circuit traces on the die
    const traces = useMemo(() => {
        const traceData: { start: [number, number, number], end: [number, number, number], color: string }[] = [];
        const y = 0.22;

        // Horizontal traces
        traceData.push({ start: [-0.6, y, -0.4], end: [0.6, y, -0.4], color: '#06b6d4' });
        traceData.push({ start: [-0.6, y, 0], end: [0.6, y, 0], color: '#8b5cf6' });
        traceData.push({ start: [-0.6, y, 0.4], end: [0.6, y, 0.4], color: '#06b6d4' });

        // Vertical traces
        traceData.push({ start: [-0.3, y, -0.5], end: [-0.3, y, 0.5], color: '#8b5cf6' });
        traceData.push({ start: [0.3, y, -0.5], end: [0.3, y, 0.5], color: '#06b6d4' });

        // Cross connections
        traceData.push({ start: [-0.5, y, -0.2], end: [-0.1, y, 0.2], color: '#f59e0b' });
        traceData.push({ start: [0.1, y, -0.2], end: [0.5, y, 0.2], color: '#f59e0b' });

        return traceData;
    }, []);

    // Electron paths
    const electronPaths = useMemo(() => {
        const y = 0.23;
        return [
            // Main horizontal paths
            [
                new THREE.Vector3(-0.65, y, -0.4),
                new THREE.Vector3(-0.2, y, -0.4),
                new THREE.Vector3(0.2, y, -0.4),
                new THREE.Vector3(0.65, y, -0.4),
            ],
            [
                new THREE.Vector3(0.65, y, 0),
                new THREE.Vector3(0.2, y, 0),
                new THREE.Vector3(-0.2, y, 0),
                new THREE.Vector3(-0.65, y, 0),
            ],
            [
                new THREE.Vector3(-0.65, y, 0.4),
                new THREE.Vector3(0, y, 0.4),
                new THREE.Vector3(0.65, y, 0.4),
            ],
            // Vertical path
            [
                new THREE.Vector3(-0.3, y, -0.55),
                new THREE.Vector3(-0.3, y, 0),
                new THREE.Vector3(-0.3, y, 0.55),
            ],
            [
                new THREE.Vector3(0.3, y, 0.55),
                new THREE.Vector3(0.3, y, 0),
                new THREE.Vector3(0.3, y, -0.55),
            ],
        ];
    }, []);

    // Die circuit pattern nodes
    const circuitNodes = useMemo(() => {
        const nodes: { pos: [number, number, number], color: string }[] = [];
        const y = 0.22;

        // Grid of nodes
        for (let x = -0.5; x <= 0.5; x += 0.25) {
            for (let z = -0.5; z <= 0.5; z += 0.25) {
                if (Math.random() > 0.4) {
                    nodes.push({
                        pos: [x, y, z],
                        color: Math.random() > 0.5 ? '#6366f1' : '#8b5cf6'
                    });
                }
            }
        }
        return nodes;
    }, []);

    return (
        <animated.group ref={groupRef} rotation={rotation as any} scale={1.6}>
            {/* Main IC Package Body - QFP style */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.2, 0.25, 2.2]} />
                <meshStandardMaterial
                    color="#1a1a1a"
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>

            {/* Package chamfer/bevel edges */}
            <mesh position={[0, 0.13, 0]}>
                <boxGeometry args={[2.15, 0.02, 2.15]} />
                <meshStandardMaterial
                    color="#252525"
                    metalness={0.4}
                    roughness={0.6}
                />
            </mesh>

            {/* Package edge highlight */}
            <lineSegments position={[0, 0.14, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(2.2, 0.01, 2.2)]} />
                <lineBasicMaterial color="#404040" />
            </lineSegments>

            {/* Silicon Die (the bright golden/copper center) */}
            <mesh ref={coreRef} position={[0, 0.14, 0]}>
                <boxGeometry args={[1.3, 0.08, 1.3]} />
                <meshStandardMaterial
                    color="#1e1e2e"
                    metalness={0.6}
                    roughness={0.3}
                    emissive="#4338ca"
                    emissiveIntensity={0.4}
                />
            </mesh>

            {/* Die surface pattern (grid) */}
            <mesh position={[0, 0.185, 0]}>
                <planeGeometry args={[1.25, 1.25]} />
                <meshBasicMaterial
                    color="#2d2d50"
                    transparent
                    opacity={0.3}
                    wireframe
                />
            </mesh>

            {/* Circuit traces */}
            {traces.map((trace, i) => (
                <CircuitTrace key={`trace-${i}`} start={trace.start} end={trace.end} color={trace.color} />
            ))}

            {/* Circuit nodes */}
            {circuitNodes.map((node, i) => (
                <mesh key={`node-${i}`} position={node.pos}>
                    <boxGeometry args={[0.04, 0.02, 0.04]} />
                    <meshBasicMaterial color={node.color} />
                </mesh>
            ))}

            {/* Electron pulses - the traveling lights */}
            {electronPaths.map((path, i) => (
                <ElectronPulse
                    key={`electron-${i}`}
                    pathPoints={path}
                    speed={0.2 + i * 0.08}
                    color={i % 2 === 0 ? "#00ffff" : "#ff00ff"}
                    size={0.035}
                />
            ))}

            {/* Pin 1 indicator (notch/dot) */}
            <mesh position={[-0.9, 0.14, -0.9]}>
                <cylinderGeometry args={[0.06, 0.06, 0.02, 16]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* IC Pins */}
            {pins.map((pin, i) => (
                <ICPin key={`pin-${i}`} position={pin.position} side={pin.side} />
            ))}

            {/* Bond wires (connecting die to package) */}
            {[-0.5, -0.25, 0, 0.25, 0.5].map((offset, i) => (
                <group key={`bond-left-${i}`}>
                    <mesh position={[-0.8, 0.18, offset]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.3, 6]} />
                        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
                    </mesh>
                </group>
            ))}
            {[-0.5, -0.25, 0, 0.25, 0.5].map((offset, i) => (
                <group key={`bond-right-${i}`}>
                    <mesh position={[0.8, 0.18, offset]}>
                        <cylinderGeometry args={[0.008, 0.008, 0.3, 6]} />
                        <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
                    </mesh>
                </group>
            ))}

            {/* Package label area */}
            <mesh position={[0.35, 0.131, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.6, 0.25]} />
                <meshBasicMaterial color="#2a2a3a" transparent opacity={0.9} />
            </mesh>

            {/* Manufacturer marking simulation */}
            <mesh position={[-0.35, 0.131, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 0.15]} />
                <meshBasicMaterial color="#3a3a4a" transparent opacity={0.8} />
            </mesh>

            {/* Subtle glow underneath */}
            <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.5, 2.5]} />
                <meshBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.08}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </animated.group>
    );
});

SiliconChip.displayName = 'SiliconChip';

export default SiliconChip;
