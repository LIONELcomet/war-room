import { useEffect, useState } from 'react';
import { fetchAlerts } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Crosshair, Cpu, Clock, AlertTriangle } from 'lucide-react';

export function ThreatMonitor() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (error) {
        console.error('Failed to load alerts', error);
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
          <ShieldAlert className="w-6 h-6 text-[#FF3B3B] alert-text" />
          Real-Time Threat Feed
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#06D6A0] shadow-[0_0_10px_#06D6A0] animate-pulse" />
          <span className="text-xs text-[#06D6A0] font-mono uppercase tracking-widest">Live Monitoring</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="space-y-4">
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id || i}
                initial={{ opacity: 0, x: -50, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`glass-panel p-4 rounded-lg border-l-4 flex flex-col gap-3 relative overflow-hidden ${alert.severity === 'CRITICAL' ? 'border-l-[#FF3B3B] bg-[#FF3B3B]/5' :
                    alert.severity === 'HIGH' ? 'border-l-[#FFD166] bg-[#FFD166]/5' :
                      'border-l-[#A066FF] bg-[#A066FF]/5'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {alert.severity === 'CRITICAL' ? (
                      <AlertTriangle className="w-5 h-5 text-[#FF3B3B] alert-text" />
                    ) : alert.severity === 'HIGH' ? (
                      <AlertTriangle className="w-5 h-5 text-[#FFD166]" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-[#A066FF] neon-text" />
                    )}
                    <span className="font-mono font-bold text-lg tracking-tight text-white">{alert.attackType || 'Unknown Attack'}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-mono font-bold uppercase tracking-widest ${alert.severity === 'CRITICAL' ? 'bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/50' :
                      alert.severity === 'HIGH' ? 'bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/50' :
                        'bg-[#A066FF]/20 text-[#A066FF] border border-[#A066FF]/50'
                    }`}>
                    {alert.severity || 'UNKNOWN'}
                  </div>
                </div>

                {alert.ai_attack_type && alert.ai_attack_type !== 'Pending Analysis' && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <div className="text-[10px] text-[#06D6A0] font-mono uppercase mb-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] animate-pulse" />
                      Gemini AI Analysis
                    </div>
                    <div className="text-sm font-bold text-white/90 italic">
                      "{alert.ai_attack_type}"
                    </div>
                    {alert.ai_recommendation && (
                      <div className="text-[10px] text-[#FFD166] mt-1 font-mono">
                        RECOMMENDED ACTION: {alert.ai_recommendation}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Crosshair className="w-4 h-4 text-[#A066FF]" />
                    <span className="text-xs uppercase tracking-widest">Source IP:</span>
                    <span className="font-mono text-white">{alert.sourceIp || '0.0.0.0'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Cpu className="w-4 h-4 text-[#06D6A0]" />
                    <span className="text-xs uppercase tracking-widest">Agent:</span>
                    <span className="font-mono text-white">{alert.detectingAgent || 'SYSTEM'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4 text-[#FFD166]" />
                    <span className="text-xs uppercase tracking-widest">Time:</span>
                    <span className="font-mono text-white">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {alert.severity === 'CRITICAL' && (
                  <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')]" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {alerts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 font-mono gap-4">
              <ShieldAlert className="w-12 h-12 opacity-50" />
              <span>NO THREATS DETECTED IN CURRENT WINDOW</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
