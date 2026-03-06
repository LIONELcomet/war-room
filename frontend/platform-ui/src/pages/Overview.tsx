import { useEffect, useState } from 'react';
import { fetchAlerts, fetchSystemState, fetchAgentStatus } from '../services/api';
import { AlertTriangle, Activity, Cpu, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

export function Overview() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [systemState, setSystemState] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [alertsData, stateData, agentsData] = await Promise.all([
          fetchAlerts(),
          fetchSystemState(),
          fetchAgentStatus()
        ]);
        setAlerts(alertsData);
        setSystemState(stateData);
        setAgents(agentsData);
      } catch (error) {
        console.error('Failed to load overview data', error);
      }
    };
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeAlertsCount = alerts.length;
  const threatLevel = systemState?.globalThreatLevel || 'UNKNOWN';
  const activeAgentsCount = agents.filter(a => a.status === 'Online').length;
  const healthValue = systemState?.systemHealth ?? 100;
  const healthLabel = healthValue >= 80 ? 'OPTIMAL' : healthValue >= 50 ? 'DEGRADED' : 'CRITICAL';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {/* Active Threat Alerts */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Active Alerts</h3>
          <AlertTriangle className="w-5 h-5 text-[#FF3B3B] alert-text" />
        </div>
        <div className="text-5xl font-mono font-bold text-white tracking-tighter">
          {activeAlertsCount}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3B3B] to-transparent" />
      </div>

      {/* Threat Level Indicator */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Threat Level</h3>
          <ShieldAlert className="w-5 h-5 text-[#FFD166]" />
        </div>
        <div className={`text-4xl font-mono font-bold tracking-tighter uppercase ${threatLevel === 'CRITICAL' ? 'text-[#FF3B3B] alert-text' :
          threatLevel === 'HIGH' ? 'text-[#FFD166]' :
            threatLevel === 'ELEVATED' ? 'text-[#FFD166]' : 'text-[#06D6A0] healthy-text'
          }`}>
          {threatLevel}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFD166] to-transparent" />
      </div>

      {/* Top Active Agents */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Active Agents</h3>
          <Cpu className="w-5 h-5 text-[#A066FF] neon-text" />
        </div>
        <div className="text-5xl font-mono font-bold text-white tracking-tighter">
          {activeAgentsCount}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#A066FF] to-transparent" />
      </div>

      {/* Recent Incidents */}
      <div className="glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold">System Status</h3>
          <Activity className="w-5 h-5 text-[#06D6A0] healthy-text" />
        </div>
        <div className="text-4xl font-mono font-bold text-[#06D6A0] healthy-text tracking-tighter uppercase">
          {healthLabel}
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#06D6A0] to-transparent" />
      </div>

      {/* Recent Alerts List */}
      <div className="col-span-1 md:col-span-2 lg:col-span-4 glass-panel p-6 rounded-xl mt-6">
        <h3 className="text-sm text-gray-400 uppercase tracking-widest font-semibold mb-6 border-b border-[#A066FF]/20 pb-2">Recent Incidents</h3>
        <div className="space-y-4">
          {alerts.slice(0, 5).map((alert, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={alert.id || i}
              className="flex items-center justify-between p-4 bg-[#7B3FE4]/5 border border-[#A066FF]/20 rounded-lg hover:bg-[#7B3FE4]/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-[#FF3B3B] shadow-[0_0_10px_#FF3B3B]' :
                  alert.severity === 'HIGH' ? 'bg-[#FFD166] shadow-[0_0_10px_#FFD166]' :
                    'bg-[#A066FF] shadow-[0_0_10px_#A066FF]'
                  }`} />
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-white">{alert.attackType || 'Unknown Attack'}</span>
                  <span className="text-xs text-gray-400 font-mono">{alert.sourceIp || '0.0.0.0'}</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs text-[#A066FF] font-mono uppercase">{alert.detectingAgent || 'SYSTEM'}</span>
                <span className="text-xs text-gray-500 font-mono">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
            </motion.div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center text-gray-500 font-mono py-8">NO ACTIVE INCIDENTS DETECTED</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
