import { useEffect, useState } from 'react';
import { fetchTimeline } from '../services/api';
import { motion } from 'motion/react';
import { Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function TimelinePage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTimeline();
        setEvents(data);
      } catch (error) {
        console.error('Failed to load timeline', error);
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
          <Clock className="w-6 h-6 text-[#A066FF] neon-text" />
          Incident Timeline
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#06D6A0] shadow-[0_0_10px_#06D6A0] animate-pulse" />
          <span className="text-xs text-[#06D6A0] font-mono uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#A066FF] via-[#A066FF]/20 to-transparent" />

        <div className="space-y-8 pl-14 py-4">
          {events.map((event, i) => (
            <motion.div
              key={event.id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative glass-panel p-5 rounded-xl border border-[#A066FF]/20 hover:border-[#A066FF]/50 transition-colors"
            >
              <div className={`absolute -left-14 top-5 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#07070D] ${event.severity === 'CRITICAL' ? 'bg-[#FF3B3B] shadow-[0_0_10px_#FF3B3B]' :
                  event.severity === 'HIGH' ? 'bg-[#FFD166] shadow-[0_0_10px_#FFD166]' :
                    event.severity === 'INFO' ? 'bg-[#06D6A0] shadow-[0_0_10px_#06D6A0]' :
                      'bg-[#A066FF] shadow-[0_0_10px_#A066FF]'
                }`}>
                {event.severity === 'CRITICAL' || event.severity === 'HIGH' ? (
                  <AlertTriangle className="w-4 h-4 text-white" />
                ) : event.severity === 'INFO' ? (
                  <Info className="w-4 h-4 text-white" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg text-white">{event.eventType}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest ${event.severity === 'CRITICAL' ? 'bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/50' :
                        event.severity === 'HIGH' ? 'bg-[#FFD166]/20 text-[#FFD166] border border-[#FFD166]/50' :
                          event.severity === 'INFO' ? 'bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/50' :
                            'bg-[#A066FF]/20 text-[#A066FF] border border-[#A066FF]/50'
                      }`}>
                      {event.severity}
                    </span>
                  </div>
                  {event.ai_insight && event.ai_insight !== 'None' && (
                    <div className="mt-1 p-2 bg-[#A066FF]/10 border border-[#A066FF]/20 rounded-lg max-w-2xl">
                      <span className="text-[10px] text-[#A066FF] font-mono uppercase tracking-widest block mb-1">AI Recommendation</span>
                      <p className="text-sm text-gray-300 font-mono italic">"{event.ai_insight}"</p>
                    </div>
                  )}
                  {event.description && !event.ai_insight && (
                    <p className="text-sm text-gray-400 font-mono">{event.description}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 min-w-[120px]">
                  <span className="text-xs text-[#A066FF] font-mono uppercase tracking-widest">{event.agent || 'SYSTEM'}</span>
                  <span className="text-xs text-gray-500 font-mono">{new Date(event.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {events.length === 0 && (
            <div className="text-center text-gray-500 font-mono py-12">
              NO EVENTS LOGGED
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
