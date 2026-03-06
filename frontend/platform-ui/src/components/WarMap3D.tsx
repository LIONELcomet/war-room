import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { fetchSystemState, fetchAlerts } from '../services/api';

const NODES = [
  { id: 'attacker', label: 'Attacker Node', position: [-5, 0, 0], type: 'external' },
  { id: 'gateway', label: 'Internet Gateway', position: [-2, 0, 0], type: 'gateway' },
  { id: 'web', label: 'Web Server', position: [1, 1.5, 0], type: 'internal' },
  { id: 'api', label: 'API Server', position: [1, -1.5, 0], type: 'internal' },
  { id: 'db', label: 'Database Server', position: [4, 0, 0], type: 'database' },
];

const CONNECTIONS = [
  { source: 'attacker', target: 'gateway' },
  { source: 'gateway', target: 'web' },
  { source: 'gateway', target: 'api' },
  { source: 'web', target: 'db' },
  { source: 'api', target: 'db' },
];

function Node({ data, state, isAttacked }: { data: any, state: string, isAttacked: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  let color = '#06D6A0'; // Healthy Green
  if (state === 'suspicious') color = '#FFD166'; // Warning Yellow
  if (state === 'isolated') color = '#808080'; // Gray
  if (isAttacked || data.id === 'attacker') color = '#FF3B3B'; // Alert Red

  return (
    <group position={data.position as [number, number, number]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial
          color={color}
          wireframe={true}
          emissive={color}
          emissiveIntensity={isAttacked ? 2 : 0.5}
        />
      </mesh>
      <Html position={[0, -0.7, 0]} center>
        <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-widest whitespace-nowrap ${isAttacked ? 'bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/50' :
            state === 'suspicious' ? 'bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/50' :
              state === 'isolated' ? 'bg-gray-800/80 text-gray-400 border border-gray-600' :
                'bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/50'
          }`}>
          {data.label}
        </div>
      </Html>
    </group>
  );
}

function ConnectionLine({ source, target, isAttacked }: { source: any, target: any, isAttacked: boolean }) {
  const points = [
    new THREE.Vector3(...source.position),
    new THREE.Vector3(...target.position)
  ];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  const particleRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (particleRef.current && isAttacked) {
      const t = (clock.getElapsedTime() * 2) % 1;
      const s = new THREE.Vector3(...source.position);
      const e = new THREE.Vector3(...target.position);
      particleRef.current.position.copy(s.lerp(e, t));
    }
  });

  return (
    <group>
      <line geometry={lineGeometry}>
        <lineBasicMaterial
          color={isAttacked ? '#FF3B3B' : '#A066FF'}
          linewidth={isAttacked ? 3 : 1}
          transparent
          opacity={isAttacked ? 0.8 : 0.3}
        />
      </line>
      {isAttacked && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#FF3B3B" />
        </mesh>
      )}
    </group>
  );
}

export function WarMap3D() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [systemState, setSystemState] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [alertsData, stateData] = await Promise.all([
          fetchAlerts(),
          fetchSystemState()
        ]);
        setAlerts(alertsData);
        setSystemState(stateData);
      } catch (error) {
        console.error('Failed to load map data', error);
      }
    };
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeTargets = alerts.map(a => a.targetNode || 'web'); // Default to web if not specified
  const isolatedNodes = systemState?.isolatedNodes || [];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-[#A066FF]/20 relative bg-[#07070D]">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <color attach="background" args={['#07070D']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <group>
          {CONNECTIONS.map((conn, i) => {
            const sourceNode = NODES.find(n => n.id === conn.source);
            const targetNode = NODES.find(n => n.id === conn.target);

            // "When server isolated: connections removed"
            if (isolatedNodes.includes(conn.source) || isolatedNodes.includes(conn.target)) {
              return null;
            }

            // "When attack occurs: highlight path: Attacker -> Web Server -> Database"
            // Let's assume an attack is happening if there are any active alerts
            const hasAttack = alerts.length > 0;
            // The highlighted path: attacker -> gateway -> web -> db
            const isAttackPath = hasAttack && (
              (conn.source === 'attacker' && conn.target === 'gateway') ||
              (conn.source === 'gateway' && conn.target === 'web') ||
              (conn.source === 'web' && conn.target === 'db')
            );

            const isAttacked = isAttackPath;

            if (!sourceNode || !targetNode) return null;

            return (
              <ConnectionLine key={i} source={sourceNode} target={targetNode} isAttacked={isAttacked} />
            );
          })}

          {NODES.map((node) => {
            const hasAttack = alerts.length > 0;
            const isAttackPathNode = hasAttack && ['attacker', 'gateway', 'web', 'db'].includes(node.id);
            const isAttacked = isAttackPathNode;
            const isIsolated = isolatedNodes.includes(node.id) || isolatedNodes.includes(node.label);

            const state = isIsolated ? 'isolated' : (isAttacked ? 'attacked' : 'healthy');

            return (
              <Node key={node.id} data={node} state={state} isAttacked={isAttacked && !isIsolated} />
            );
          })}
        </group>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute top-4 left-4 glass-panel p-3 rounded-lg flex flex-col gap-2">
        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest border-b border-[#A066FF]/20 pb-1">Legend</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#06D6A0] shadow-[0_0_5px_#06D6A0]" />
          <span className="text-[10px] font-mono text-gray-400 uppercase">Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FFD166] shadow-[0_0_5px_#FFD166]" />
          <span className="text-[10px] font-mono text-gray-400 uppercase">Suspicious</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF3B3B] shadow-[0_0_5px_#FF3B3B]" />
          <span className="text-[10px] font-mono text-gray-400 uppercase">Under Attack</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500 shadow-[0_0_5px_gray]" />
          <span className="text-[10px] font-mono text-gray-400 uppercase">Isolated</span>
        </div>
      </div>
    </div>
  );
}
