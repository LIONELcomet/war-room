import { useEffect, useState } from 'react';
import { fetchSystemState } from '../services/api';
import { motion } from 'motion/react';
import { Zap, Shield, ServerOff, UserX, Network } from 'lucide-react';

export function ResponsePage() {
  const [systemState, setSystemState] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSystemState();
        setSystemState(data);
      } catch (error) {
        console.error('Failed to load system state', error);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const isolatedNodes = systemState?.isolatedNodes || [];
  const blockedIps = systemState?.blockedIps || [];
  const disabledUsers = systemState?.disabledUsers || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 h-full"
    >
      <div className="flex items-center justify-between border-b border-[#A066FF]/20 pb-4">
        <h2 className="text-xl font-bold tracking-widest text-white neon-text uppercase flex items-center gap-3">
          <Zap className="w-6 h-6 text-[#A066FF] neon-text" />
          Response Engine
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#06D6A0] shadow-[0_0_10px_#06D6A0] animate-pulse" />
          <span className="text-xs text-[#06D6A0] font-mono uppercase tracking-widest">Automated Actions Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-6">
        {/* Blocked IPs */}
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#A066FF]/20 pb-2">
            <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <Network className="w-4 h-4 text-[#FF3B3B]" />
              Blocked IPs
            </h3>
            <span className="font-mono text-xs text-[#FF3B3B] bg-[#FF3B3B]/20 px-2 py-1 rounded border border-[#FF3B3B]/50">
              {blockedIps.length} BLOCKED
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {blockedIps.map((ip: string, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#FF3B3B]/5 border border-[#FF3B3B]/20 rounded">
                <span className="font-mono text-sm text-white">{ip}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">CONTAINED</span>
              </div>
            ))}
            {blockedIps.length === 0 && (
              <div className="text-center text-gray-500 font-mono py-4 text-sm">NO BLOCKED IPS</div>
            )}
          </div>
        </div>

        {/* Isolated Servers */}
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#A066FF]/20 pb-2">
            <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <ServerOff className="w-4 h-4 text-[#FFD166]" />
              Isolated Servers
            </h3>
            <span className="font-mono text-xs text-[#FFD166] bg-[#FFD166]/20 px-2 py-1 rounded border border-[#FFD166]/50">
              {isolatedNodes.length} ISOLATED
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {isolatedNodes.map((node: string, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#FFD166]/5 border border-[#FFD166]/20 rounded">
                <span className="font-mono text-sm text-white">{node}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">QUARANTINED</span>
              </div>
            ))}
            {isolatedNodes.length === 0 && (
              <div className="text-center text-gray-500 font-mono py-4 text-sm">NO ISOLATED SERVERS</div>
            )}
          </div>
        </div>

        {/* Disabled Users */}
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#A066FF]/20 pb-2">
            <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold flex items-center gap-2">
              <UserX className="w-4 h-4 text-[#A066FF]" />
              Disabled Users
            </h3>
            <span className="font-mono text-xs text-[#A066FF] bg-[#A066FF]/20 px-2 py-1 rounded border border-[#A066FF]/50">
              {disabledUsers.length} DISABLED
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {disabledUsers.map((user: string, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 bg-[#A066FF]/5 border border-[#A066FF]/20 rounded">
                <span className="font-mono text-sm text-white">{user}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">LOCKED</span>
              </div>
            ))}
            {disabledUsers.length === 0 && (
              <div className="text-center text-gray-500 font-mono py-4 text-sm">NO DISABLED USERS</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
