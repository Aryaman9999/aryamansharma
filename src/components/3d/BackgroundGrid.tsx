import { useRef, useMemo, memo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BackgroundGridProps {
    scrollY?: number;
}

// Shared geometry for instancing
const particleGeometry = new THREE.CircleGeometry(0.03, 4); // Reduced to 4-sided shape
const nodeGeometry = new THREE.SphereGeometry(0.04, 4, 4);

// Optimized flowing particles using InstancedMesh
const DataParticles = memo(() => {
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
    const count = 50; // Reduced from 80
    const frameSkip = useRef(0);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const velocities = useMemo(() => {
        const vel = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            vel[i * 3] = (Math.random() - 0.5) * 0.015;
            vel[i * 3 + 1] = -Math.random() * 0.015 - 0.008;
            vel[i * 3 + 2] = 0;
        }
        return vel;
    }, []);

    // Initialize positions
    const positions = useMemo(() => {
        const pos: THREE.Vector3[] = [];
        for (let i = 0; i < count; i++) {
            pos.push(new THREE.Vector3(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 10 - 5
            ));
        }
        return pos;
    }, []);

    // Set initial matrix
    useMemo(() => {
        if (!instancedMeshRef.current) return;
        for (let i = 0; i < count; i++) {
            dummy.position.copy(positions[i]);
            dummy.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
        }
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [positions, dummy]);

    useFrame(() => {
        // Skip 2 out of 3 frames
        frameSkip.current++;
        if (frameSkip.current % 3 !== 0) return;
        if (!instancedMeshRef.current) return;

        for (let i = 0; i < count; i++) {
            positions[i].x += velocities[i * 3];
            positions[i].y += velocities[i * 3 + 1];

            // Reset particles that fall below
            if (positions[i].y < -15) {
                positions[i].x = (Math.random() - 0.5) * 30;
                positions[i].y = 15;
            }

            dummy.position.copy(positions[i]);
            dummy.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
        }

        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={instancedMeshRef}
            args={[particleGeometry, undefined, count]}
        >
            <meshBasicMaterial
                color="#6366f1"
                transparent
                opacity={0.5}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    );
});

DataParticles.displayName = 'DataParticles';

// Simplified static grid - no animation
const StaticGrid = memo(() => {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
                <planeGeometry args={[50, 50, 20, 20]} />
                <meshBasicMaterial
                    color="#0a0a15"
                    wireframe
                    transparent
                    opacity={0.2}
                />
            </mesh>

            {/* Glowing horizon line */}
            <mesh position={[0, -5, -20]} rotation={[0, 0, 0]}>
                <planeGeometry args={[80, 0.3]} />
                <meshBasicMaterial
                    color="#6366f1"
                    transparent
                    opacity={0.35}
                />
            </mesh>
        </group>
    );
});

StaticGrid.displayName = 'StaticGrid';

// Static circuit nodes - reduced with instancing
const StaticNodes = memo(() => {
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
    const count = 15; // Reduced from 25
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const nodePositions = useMemo(() => {
        const nodes: THREE.Vector3[] = [];
        for (let i = 0; i < count; i++) {
            nodes.push(new THREE.Vector3(
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 15,
                -8 - Math.random() * 5
            ));
        }
        return nodes;
    }, []);

    // Set initial matrix
    useMemo(() => {
        if (!instancedMeshRef.current) return;
        for (let i = 0; i < count; i++) {
            dummy.position.copy(nodePositions[i]);
            dummy.updateMatrix();
            instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
        }
        instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }, [nodePositions, dummy]);

    return (
        <instancedMesh
            ref={instancedMeshRef}
            args={[nodeGeometry, undefined, count]}
        >
            <meshBasicMaterial color="#8b5cf6" transparent opacity={0.3} />
        </instancedMesh>
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
            <ambientLight intensity={0.12} />
            <pointLight position={[10, 10, 5]} intensity={0.3} color="#6366f1" distance={50} />
        </group>
    );
});

BackgroundGrid.displayName = 'BackgroundGrid';

export default BackgroundGrid;

