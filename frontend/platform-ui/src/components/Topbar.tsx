import { ShieldAlert, Activity, ShieldCheck, Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchSystemState } from '../services/api';

export function Topbar() {
  const [systemState, setSystemState] = useState<any>(null);

  useEffect(() => {
    const loadState = async () => {
      try {
        const data = await fetchSystemState();
        setSystemState(data);
      } catch (error) {
        console.error('Failed to fetch system state:', error);
      }
    };
    loadState();
    const interval = setInterval(loadState, 5000);
    return () => clearInterval(interval);
  }, []);

  const threatLevel = systemState?.globalThreatLevel || 'NORMAL';
  const activeIncidents = systemState?.activeIncidents || 0;
  const commanderStatus = systemState?.commanderStatus || 'ONLINE';
  const healthValue = systemState?.systemHealth ?? 100;
  const health = healthValue >= 80 ? 'OPTIMAL' : healthValue >= 50 ? 'DEGRADED' : 'CRITICAL';

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-[#FF3B3B] alert-text';
      case 'HIGH': return 'text-[#FFD166] text-shadow-[0_0_10px_#FFD166]';
      case 'ELEVATED': return 'text-[#FFD166]';
      case 'NORMAL': return 'text-[#06D6A0] healthy-text';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="h-16 glass-panel border-b border-[#A066FF]/20 flex items-center justify-between px-6 z-10 relative">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-bold tracking-widest text-white neon-text uppercase">
          COMMANDROOM – Cyber Defense Platform
        </h2>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-5 h-5 ${getThreatColor(threatLevel)}`} />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Global Threat Level</span>
            <span className={`text-sm font-bold tracking-widest ${getThreatColor(threatLevel)}`}>{threatLevel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#A066FF]" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Active Incidents</span>
            <span className="text-sm font-bold text-white">{activeIncidents}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#06D6A0]" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Commander Status</span>
            <span className="text-sm font-bold text-[#06D6A0] healthy-text">{commanderStatus}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-[#06D6A0]" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">System Health</span>
            <span className="text-sm font-bold text-[#06D6A0] healthy-text">{health}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
