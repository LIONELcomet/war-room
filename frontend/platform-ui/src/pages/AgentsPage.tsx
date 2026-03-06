import { useEffect, useState } from 'react';
import { fetchAgentStatus } from '../services/api';
import { motion } from 'motion/react';
import { Cpu, Activity, ShieldCheck, Zap } from 'lucide-react';

export function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAgentStatus();
        setAgents(data);
      } catch (error) {
        console.error('Failed to load agents', error);
      }
    };
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 h-full"
    >
      <div className="flex items-center justify-between border-b border-[#A066FF]/20 pb-4">
        <h2 className="text-xl font-bold tracking-widest text-white neon-text uppercase flex items-center gap-3">
          <Cpu className="w-6 h-6 text-[#A066FF] neon-text" />
          Security Agents
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#06D6A0] shadow-[0_0_10px_#06D6A0] animate-pulse" />
          <span className="text-xs text-[#06D6A0] font-mono uppercase tracking-widest">Agents Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 pb-6">
        {agents.map((agent, i) => {
          const isOnline = agent.status === 'Online' || agent.status === 'ACTIVE';
          const isLearning = agent.status === 'Learning' || agent.status === 'TRAINING';

          return (
            <motion.div
              key={agent.id || i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group hover:border-[#A066FF]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isOnline ? 'bg-[#06D6A0]/20 text-[#06D6A0]' :
                    isLearning ? 'bg-[#A066FF]/20 text-[#A066FF]' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                    {agent.name?.includes('Adaptive') ? <Zap className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                  </div>
                  <h3 className="font-mono font-bold text-lg tracking-tight text-white">{agent.name}</h3>
                </div>
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-[#06D6A0] shadow-[0_0_10px_#06D6A0]' :
                  isLearning ? 'bg-[#A066FF] shadow-[0_0_10px_#A066FF] animate-pulse' :
                    'bg-gray-500'
                  }`} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Status</span>
                  <span className={`font-mono text-sm font-bold uppercase ${isOnline ? 'text-[#06D6A0]' :
                    isLearning ? 'text-[#A066FF]' :
                      'text-gray-400'
                    }`}>
                    {agent.name?.includes('Adaptive') && isLearning ? 'TRAINING' : agent.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Health</span>
                  <span className="font-mono text-sm font-bold text-[#06D6A0]">{agent.healthIndicator || '100%'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 mt-2 p-3 bg-black/20 rounded-lg border border-white/5">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Last Detection
                </span>
                <span className="font-mono text-xs text-white truncate">
                  {agent.lastDetection || 'No recent events'}
                </span>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br from-[#A066FF] to-transparent" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
