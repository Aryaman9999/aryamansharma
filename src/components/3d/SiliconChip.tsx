import { useRef, useMemo, memo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

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

// Shared geometries - created once and reused
const sharedGeometries = {
    electronCore: new THREE.SphereGeometry(0.04, 8, 8),
    electronGlow: new THREE.SphereGeometry(0.08, 6, 6),
    circuitNode: new THREE.BoxGeometry(0.05, 0.025, 0.05),
    smallNode: new THREE.BoxGeometry(0.03, 0.02, 0.03),
};

// Optimized electron pulse with trail effect
const ElectronPulse = memo(({ pathPoints, speed = 1, color = '#00ffff', glowColor = '#00ffff' }: {
    pathPoints: THREE.Vector3[],
    speed?: number,
    color?: string,
    glowColor?: string
}) => {
    const pulseRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const trailRef = useRef<THREE.Mesh>(null);
    const frameSkip = useRef(0);

    useFrame(({ clock }) => {
        frameSkip.current++;
        if (frameSkip.current % 2 !== 0) return;
        if (!pulseRef.current) return;

        const t = (clock.getElapsedTime() * speed) % 1;
        const index = Math.floor(t * (pathPoints.length - 1));
        const nextIndex = Math.min(index + 1, pathPoints.length - 1);
        const localT = (t * (pathPoints.length - 1)) % 1;

        const pos = pathPoints[index].clone().lerp(pathPoints[nextIndex], localT);
        pulseRef.current.position.copy(pos);

        if (glowRef.current) {
            glowRef.current.position.copy(pos);
            // Pulsating glow
            const pulse = 0.8 + Math.sin(clock.getElapsedTime() * 8) * 0.2;
            glowRef.current.scale.setScalar(pulse);
        }

        // Trail slightly behind
        if (trailRef.current) {
            const trailT = Math.max(0, t - 0.05);
            const trailIndex = Math.floor(trailT * (pathPoints.length - 1));
            const trailNextIndex = Math.min(trailIndex + 1, pathPoints.length - 1);
            const trailLocalT = (trailT * (pathPoints.length - 1)) % 1;
            const trailPos = pathPoints[trailIndex].clone().lerp(pathPoints[trailNextIndex], trailLocalT);
            trailRef.current.position.copy(trailPos);
        }
    });

    return (
        <group>
            {/* Trail */}
            <mesh ref={trailRef}>
                <sphereGeometry args={[0.025, 6, 6]} />
                <meshBasicMaterial color={color} transparent opacity={0.4} />
            </mesh>
            {/* Outer glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={glowColor} transparent opacity={0.2} />
            </mesh>
            {/* Core */}
            <mesh ref={pulseRef}>
                <sphereGeometry args={[0.045, 8, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>
        </group>
    );
});

ElectronPulse.displayName = 'ElectronPulse';

// Enhanced IC Pin with gull-wing style
const ICPin = memo(({ position, side, isDark }: {
    position: [number, number, number],
    side: 'left' | 'right' | 'top' | 'bottom',
    isDark: boolean
}) => {
    const isHorizontal = side === 'left' || side === 'right';
    const pinColor = isDark ? '#c0c0c0' : '#a0a0a0';
    const tipColor = isDark ? '#e8e8e8' : '#d0d0d0';

    // Gull-wing pin shape
    const bendOffset = isHorizontal
        ? (side === 'left' ? -0.12 : 0.12)
        : (side === 'top' ? -0.12 : 0.12);

    return (
        <group position={position}>
            {/* Main pin body */}
            <mesh rotation={isHorizontal ? [0, 0, 0] : [0, Math.PI / 2, 0]}>
                <boxGeometry args={[0.28, 0.025, 0.05]} />
                <meshStandardMaterial color={pinColor} metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Pin tip (bent down) */}
            <mesh
                position={isHorizontal ? [bendOffset, -0.03, 0] : [0, -0.03, bendOffset]}
                rotation={isHorizontal ? [0, 0, 0] : [0, Math.PI / 2, 0]}
            >
                <boxGeometry args={[0.08, 0.035, 0.055]} />
                <meshStandardMaterial color={tipColor} metalness={0.98} roughness={0.05} />
            </mesh>
        </group>
    );
});

ICPin.displayName = 'ICPin';

// Glowing corner accent
const CornerAccent = memo(({ position, isDark }: {
    position: [number, number, number],
    isDark: boolean
}) => {
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (glowRef.current) {
            const intensity = 0.3 + Math.sin(clock.getElapsedTime() * 2 + position[0] * 5) * 0.15;
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = intensity;
        }
    });

    return (
        <mesh ref={glowRef} position={position}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial
                color={isDark ? '#a78bfa' : '#7c3aed'}
                transparent
                opacity={0.3}
            />
        </mesh>
    );
});

CornerAccent.displayName = 'CornerAccent';

interface SiliconChipProps {
    mousePosition: { x: number; y: number };
}

export const SiliconChip = memo(({ mousePosition }: SiliconChipProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const frameCount = useRef(0);
    const lastEmissive = useRef(0.5);
    const isDark = useTheme();

    // Theme-aware colors - premium aesthetic
    const colors = useMemo(() => ({
        // Package body - ceramic/plastic IC look
        packageBody: isDark ? '#4a4a5a' : '#1f1f2f',
        packageBodyMetalness: isDark ? 0.3 : 0.2,
        packageBodyRoughness: isDark ? 0.6 : 0.8,
        // Chamfer edges - subtle highlight
        chamfer: isDark ? '#5a5a6a' : '#2a2a3a',
        chamferMetalness: isDark ? 0.4 : 0.3,
        // Package rim - metallic edge
        rim: isDark ? '#7a7a8a' : '#3a3a4a',
        rimEmissive: isDark ? '#6366f1' : '#4338ca',
        // Silicon die - the star of the show
        dieBase: isDark ? '#1a1a3a' : '#0f0f2a',
        dieEmissive: isDark ? '#818cf8' : '#6366f1',
        dieEmissiveIntensity: isDark ? 0.8 : 0.5,
        // Die overlay pattern
        diePattern: isDark ? '#3b3b6b' : '#2a2a5a',
        // Circuit traces
        traceColor1: '#22d3ee', // Cyan
        traceColor2: '#a855f7', // Purple
        traceColor3: '#f472b6', // Pink
        // Corner accents
        accentColor: isDark ? '#a78bfa' : '#7c3aed',
        // Glow
        glowColor: isDark ? '#818cf8' : '#6366f1',
        glowOpacity: isDark ? 0.25 : 0.12,
        // Heat spreader lid
        lidColor: isDark ? '#606070' : '#404050',
        lidMetalness: isDark ? 0.8 : 0.6,
    }), [isDark]);

    // Smoother rotation based on mouse
    const { rotation } = useSpring({
        rotation: [
            mousePosition.y * 0.12,
            mousePosition.x * 0.18,
            0
        ],
        config: { mass: 2, tension: 60, friction: 25 }
    });

    useFrame(({ clock }) => {
        frameCount.current++;
        if (frameCount.current % 3 !== 0) return;

        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.05;
            groupRef.current.rotation.y += 0.0004;
        }

        // Pulsating die emissive
        if (frameCount.current % 6 === 0 && coreRef.current && coreRef.current.material) {
            const baseIntensity = isDark ? 0.8 : 0.5;
            const target = baseIntensity + Math.sin(clock.getElapsedTime() * 2) * 0.2;
            lastEmissive.current += (target - lastEmissive.current) * 0.15;
            (coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = lastEmissive.current;
        }
    });

    // Generate pins for all 4 sides
    const pins = useMemo(() => {
        const pinData: { position: [number, number, number], side: 'left' | 'right' | 'top' | 'bottom' }[] = [];
        const pinCount = 8;
        const spacing = 1.4 / (pinCount - 1);
        const startOffset = -0.7;

        for (let i = 0; i < pinCount; i++) {
            pinData.push({ position: [-1.25, 0.02, startOffset + i * spacing], side: 'left' });
            pinData.push({ position: [1.25, 0.02, startOffset + i * spacing], side: 'right' });
            pinData.push({ position: [startOffset + i * spacing, 0.02, -1.25], side: 'top' });
            pinData.push({ position: [startOffset + i * spacing, 0.02, 1.25], side: 'bottom' });
        }

        return pinData;
    }, []);

    // Circuit traces - more intricate
    const traces = useMemo(() => {
        const traceData: { start: [number, number, number], end: [number, number, number], color: string, width: number }[] = [];
        const y = 0.21;

        // Main horizontal traces
        traceData.push({ start: [-0.55, y, -0.35], end: [0.55, y, -0.35], color: colors.traceColor1, width: 0.012 });
        traceData.push({ start: [-0.55, y, 0], end: [0.55, y, 0], color: colors.traceColor2, width: 0.015 });
        traceData.push({ start: [-0.55, y, 0.35], end: [0.55, y, 0.35], color: colors.traceColor1, width: 0.012 });

        // Main vertical traces
        traceData.push({ start: [-0.35, y, -0.55], end: [-0.35, y, 0.55], color: colors.traceColor3, width: 0.012 });
        traceData.push({ start: [0, y, -0.55], end: [0, y, 0.55], color: colors.traceColor2, width: 0.015 });
        traceData.push({ start: [0.35, y, -0.55], end: [0.35, y, 0.55], color: colors.traceColor3, width: 0.012 });

        // Diagonal accents
        traceData.push({ start: [-0.4, y, -0.4], end: [-0.2, y, -0.2], color: colors.traceColor2, width: 0.008 });
        traceData.push({ start: [0.4, y, -0.4], end: [0.2, y, -0.2], color: colors.traceColor2, width: 0.008 });
        traceData.push({ start: [-0.4, y, 0.4], end: [-0.2, y, 0.2], color: colors.traceColor2, width: 0.008 });
        traceData.push({ start: [0.4, y, 0.4], end: [0.2, y, 0.2], color: colors.traceColor2, width: 0.008 });

        return traceData;
    }, [colors]);

    // Electron paths - keeping the flowing electrons!
    const electronPaths = useMemo(() => {
        const y = 0.22;
        return [
            {
                points: [
                    new THREE.Vector3(-0.6, y, -0.35),
                    new THREE.Vector3(0, y, -0.35),
                    new THREE.Vector3(0.6, y, -0.35),
                ],
                color: '#22d3ee',
                glow: '#06b6d4',
                speed: 0.18
            },
            {
                points: [
                    new THREE.Vector3(0.6, y, 0.35),
                    new THREE.Vector3(0, y, 0.35),
                    new THREE.Vector3(-0.6, y, 0.35),
                ],
                color: '#22d3ee',
                glow: '#06b6d4',
                speed: 0.2
            },
            {
                points: [
                    new THREE.Vector3(-0.35, y, -0.55),
                    new THREE.Vector3(-0.35, y, 0),
                    new THREE.Vector3(-0.35, y, 0.55),
                ],
                color: '#f472b6',
                glow: '#ec4899',
                speed: 0.15
            },
            {
                points: [
                    new THREE.Vector3(0.35, y, 0.55),
                    new THREE.Vector3(0.35, y, 0),
                    new THREE.Vector3(0.35, y, -0.55),
                ],
                color: '#f472b6',
                glow: '#ec4899',
                speed: 0.17
            },
            {
                points: [
                    new THREE.Vector3(0, y, -0.55),
                    new THREE.Vector3(0, y, 0),
                    new THREE.Vector3(0, y, 0.55),
                ],
                color: '#a855f7',
                glow: '#8b5cf6',
                speed: 0.22
            },
        ];
    }, []);

    // Circuit nodes at intersections
    const circuitNodes = useMemo(() => {
        const nodes: { pos: [number, number, number], color: string, size: 'large' | 'small' }[] = [];
        const y = 0.21;

        // Major intersection nodes
        const majorPositions = [
            [0, 0], [-0.35, 0], [0.35, 0], [0, -0.35], [0, 0.35],
            [-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]
        ];

        majorPositions.forEach(([x, z]) => {
            nodes.push({
                pos: [x, y, z],
                color: '#a855f7',
                size: 'large'
            });
        });

        // Smaller nodes along traces
        const minorPositions = [
            [-0.5, -0.35], [0.5, -0.35], [-0.5, 0.35], [0.5, 0.35],
            [-0.35, -0.5], [-0.35, 0.5], [0.35, -0.5], [0.35, 0.5],
        ];

        minorPositions.forEach(([x, z]) => {
            nodes.push({
                pos: [x, y, z],
                color: '#22d3ee',
                size: 'small'
            });
        });

        return nodes;
    }, []);

    // Bond wire positions
    const bondWires = useMemo(() => {
        const wires: { start: [number, number, number], end: [number, number, number] }[] = [];
        const dieEdge = 0.6;
        const packageEdge = 0.95;
        const positions = [-0.5, -0.25, 0, 0.25, 0.5];

        positions.forEach(offset => {
            // Left side
            wires.push({ start: [-dieEdge, 0.19, offset], end: [-packageEdge, 0.12, offset] });
            // Right side
            wires.push({ start: [dieEdge, 0.19, offset], end: [packageEdge, 0.12, offset] });
            // Top side
            wires.push({ start: [offset, 0.19, -dieEdge], end: [offset, 0.12, -packageEdge] });
            // Bottom side
            wires.push({ start: [offset, 0.19, dieEdge], end: [offset, 0.12, packageEdge] });
        });

        return wires;
    }, []);

    return (
        <animated.group ref={groupRef} rotation={rotation as any} scale={1.5}>
            {/* Main IC Package Body */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[2.4, 0.22, 2.4]} />
                <meshStandardMaterial
                    color={colors.packageBody}
                    metalness={colors.packageBodyMetalness}
                    roughness={colors.packageBodyRoughness}
                />
            </mesh>

            {/* Package bevel/chamfer - top edge */}
            <mesh position={[0, 0.12, 0]}>
                <boxGeometry args={[2.35, 0.02, 2.35]} />
                <meshStandardMaterial
                    color={colors.chamfer}
                    metalness={colors.chamferMetalness}
                    roughness={0.5}
                />
            </mesh>

            {/* Metallic rim around package */}
            <lineSegments position={[0, 0.14, 0]}>
                <edgesGeometry args={[new THREE.BoxGeometry(2.4, 0.01, 2.4)]} />
                <lineBasicMaterial color={colors.rim} linewidth={2} />
            </lineSegments>

            {/* Silicon Die - main center piece */}
            <mesh ref={coreRef} position={[0, 0.15, 0]}>
                <boxGeometry args={[1.35, 0.06, 1.35]} />
                <meshStandardMaterial
                    color={colors.dieBase}
                    metalness={0.4}
                    roughness={0.3}
                    emissive={colors.dieEmissive}
                    emissiveIntensity={colors.dieEmissiveIntensity}
                />
            </mesh>

            {/* Die surface - inner silicon with gradient effect */}
            <mesh position={[0, 0.181, 0]}>
                <boxGeometry args={[1.3, 0.005, 1.3]} />
                <meshStandardMaterial
                    color={colors.diePattern}
                    metalness={0.5}
                    roughness={0.4}
                    emissive={colors.dieEmissive}
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Die grid pattern overlay */}
            <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1.25, 1.25, 8, 8]} />
                <meshBasicMaterial
                    color={colors.diePattern}
                    transparent
                    opacity={0.4}
                    wireframe
                />
            </mesh>

            {/* Circuit traces */}
            {traces.map((trace, i) => {
                const midPoint: [number, number, number] = [
                    (trace.start[0] + trace.end[0]) / 2,
                    (trace.start[1] + trace.end[1]) / 2,
                    (trace.start[2] + trace.end[2]) / 2
                ];
                const length = Math.sqrt(
                    Math.pow(trace.end[0] - trace.start[0], 2) +
                    Math.pow(trace.end[2] - trace.start[2], 2)
                );
                const isHorizontal = Math.abs(trace.end[0] - trace.start[0]) > Math.abs(trace.end[2] - trace.start[2]);

                return (
                    <mesh
                        key={`trace-${i}`}
                        position={midPoint}
                        rotation={isHorizontal ? [0, 0, 0] : [0, Math.PI / 2, 0]}
                    >
                        <boxGeometry args={[length, 0.008, trace.width]} />
                        <meshBasicMaterial color={trace.color} transparent opacity={0.9} />
                    </mesh>
                );
            })}

            {/* Circuit nodes */}
            {circuitNodes.map((node, i) => (
                <mesh
                    key={`node-${i}`}
                    position={node.pos}
                    geometry={node.size === 'large' ? sharedGeometries.circuitNode : sharedGeometries.smallNode}
                >
                    <meshBasicMaterial color={node.color} />
                </mesh>
            ))}

            {/* Electron pulses - the flowing lights you love! */}
            {electronPaths.map((path, i) => (
                <ElectronPulse
                    key={`electron-${i}`}
                    pathPoints={path.points}
                    speed={path.speed}
                    color={path.color}
                    glowColor={path.glow}
                />
            ))}

            {/* Pin 1 indicator - chamfered corner */}
            <mesh position={[-1.0, 0.14, -1.0]} rotation={[0, Math.PI / 4, 0]}>
                <boxGeometry args={[0.25, 0.04, 0.08]} />
                <meshStandardMaterial color={colors.chamfer} metalness={0.5} roughness={0.4} />
            </mesh>

            {/* Pin 1 dot indicator */}
            <mesh position={[-0.95, 0.16, -0.95]}>
                <cylinderGeometry args={[0.06, 0.06, 0.015, 12]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Corner accent glows */}
            <CornerAccent position={[-0.55, 0.2, -0.55]} isDark={isDark} />
            <CornerAccent position={[0.55, 0.2, -0.55]} isDark={isDark} />
            <CornerAccent position={[-0.55, 0.2, 0.55]} isDark={isDark} />
            <CornerAccent position={[0.55, 0.2, 0.55]} isDark={isDark} />

            {/* IC Pins */}
            {pins.map((pin, i) => (
                <ICPin key={`pin-${i}`} position={pin.position} side={pin.side} isDark={isDark} />
            ))}

            {/* Bond wires - gold connections from die to package */}
            {bondWires.map((wire, i) => {
                const midX = (wire.start[0] + wire.end[0]) / 2;
                const midY = Math.max(wire.start[1], wire.end[1]) + 0.06; // Arc up
                const midZ = (wire.start[2] + wire.end[2]) / 2;

                return (
                    <group key={`bond-${i}`}>
                        {/* Simple arc represented by 2 segments */}
                        <mesh position={[(wire.start[0] + midX) / 2, (wire.start[1] + midY) / 2, (wire.start[2] + midZ) / 2]}>
                            <cylinderGeometry args={[0.008, 0.008, 0.15, 4]} />
                            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
                        </mesh>
                        <mesh position={[(wire.end[0] + midX) / 2, (wire.end[1] + midY) / 2, (wire.end[2] + midZ) / 2]}>
                            <cylinderGeometry args={[0.008, 0.008, 0.15, 4]} />
                            <meshStandardMaterial color="#ffd700" metalness={0.9} roughness={0.1} />
                        </mesh>
                    </group>
                );
            })}

            {/* Package text/label area */}
            <mesh position={[0.4, 0.131, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.7, 0.2]} />
                <meshBasicMaterial color={colors.chamfer} transparent opacity={0.8} />
            </mesh>

            {/* Decorative lines on label */}
            <mesh position={[0.4, 0.132, -0.55]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.5, 0.02]} />
                <meshBasicMaterial color={colors.accentColor} transparent opacity={0.6} />
            </mesh>
            <mesh position={[0.4, 0.132, -0.45]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 0.015]} />
                <meshBasicMaterial color={colors.accentColor} transparent opacity={0.4} />
            </mesh>

            {/* Secondary marking */}
            <mesh position={[-0.4, 0.131, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.5, 0.15]} />
                <meshBasicMaterial color={colors.chamfer} transparent opacity={0.7} />
            </mesh>

            {/* Subtle underglow */}
            <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2.8, 2.8]} />
                <meshBasicMaterial
                    color={colors.glowColor}
                    transparent
                    opacity={colors.glowOpacity}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Inner glow ring around die */}
            <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.68, 0.72, 32]} />
                <meshBasicMaterial
                    color={colors.glowColor}
                    transparent
                    opacity={isDark ? 0.4 : 0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </animated.group>
    );
});

SiliconChip.displayName = 'SiliconChip';

export default SiliconChip;
