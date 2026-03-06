import { useEffect, useState } from 'react';
import { fetchAgentStatus, fetchAlerts } from '../services/api';
import { motion } from 'motion/react';
import { Server, Activity, ShieldAlert, Cpu } from 'lucide-react';

export function SystemHealthPage() {
    const [agents, setAgents] = useState<any[]>([]);
    const [alerts, setAlerts] = useState<any[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [agentsData, alertsData] = await Promise.all([
                    fetchAgentStatus(),
                    fetchAlerts()
                ]);
                setAgents(agentsData);
                setAlerts(alertsData);
            } catch (error) {
                console.error('Failed to load system health data', error);
            }
        };
        loadData();
        const interval = setInterval(loadData, 3000);
        return () => clearInterval(interval);
    }, []);

    const getAgentCondition = (agent: any, agentAlerts: any[]) => {
        if (agent.status !== 'Online' && agent.status !== 'ACTIVE') {
            return 'RED';
        }

        const hasCritical = agentAlerts.some(a => a.severity === 'CRITICAL');
        if (hasCritical) return 'RED';

        const hasWarning = agentAlerts.some(a => ['HIGH', 'MEDIUM'].includes(a.severity));
        if (hasWarning) return 'YELLOW';

        return 'GREEN';
    };

    const getConditionStyles = (condition: string) => {
        switch (condition) {
            case 'RED':
                return {
                    border: 'border-[#EF476F]/50',
                    bg: 'bg-[#EF476F]/10',
                    text: 'text-[#EF476F]',
                    shadow: 'shadow-[0_0_15px_rgba(239,71,111,0.3)]',
                    icon: 'text-[#EF476F]',
                    glow: 'bg-[#EF476F]'
                };
            case 'YELLOW':
                return {
                    border: 'border-[#FFD166]/50',
                    bg: 'bg-[#FFD166]/10',
                    text: 'text-[#FFD166]',
                    shadow: 'shadow-[0_0_15px_rgba(255,209,102,0.3)]',
                    icon: 'text-[#FFD166]',
                    glow: 'bg-[#FFD166]'
                };
            case 'GREEN':
            default:
                return {
                    border: 'border-[#06D6A0]/30 hover:border-[#06D6A0]/50',
                    bg: 'bg-[#06D6A0]/5',
                    text: 'text-[#06D6A0]',
                    shadow: 'hover:shadow-[0_0_15px_rgba(6,214,160,0.1)]',
                    icon: 'text-[#06D6A0]',
                    glow: 'bg-[#06D6A0]'
                };
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 h-full"
        >
            <div className="flex items-center justify-between border-b border-[#A066FF]/20 pb-4">
                <h2 className="text-xl font-bold tracking-widest text-white neon-text uppercase flex items-center gap-3">
                    <Server className="w-6 h-6 text-[#A066FF] neon-text" />
                    System Health Module
                </h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto pr-2 pb-6 h-full">
                {agents.map((agent, i) => {
                    // Find alerts specific to this agent
                    const agentIdStr = (agent.id || agent.name || '').toLowerCase().replace(' ', '_');
                    const agentAlerts = alerts.filter(a => {
                        const detectingAgent = (a.detectingAgent || a.detecting_agent || '').toLowerCase();
                        return detectingAgent.includes(agentIdStr) || detectingAgent === agentIdStr || agentIdStr.includes(detectingAgent.replace('_agent', ''));
                    });

                    const condition = getAgentCondition(agent, agentAlerts);
                    const styles = getConditionStyles(condition);

                    return (
                        <motion.div
                            key={agent.name || i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass-panel p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300 border ${styles.border} ${styles.bg} ${styles.shadow}`}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-black/30 ${styles.icon}`}>
                                        <Cpu className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-mono font-bold text-lg tracking-tight text-white">{agent.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${styles.glow} animate-pulse`} />
                                            <span className={`text-[10px] font-mono uppercase tracking-widest ${styles.text}`}>
                                                Condition {condition}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-mono font-bold text-white">
                                        {agent.healthIndicator || 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                                        Health Score
                                    </div>
                                </div>
                            </div>

                            {/* Status Row */}
                            <div className="grid grid-cols-2 gap-4 bg-black/20 rounded-lg p-3">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Connection</span>
                                    <span className={`font-mono text-sm font-bold uppercase ${agent.status === 'Online' || agent.status === 'ACTIVE'
                                        ? 'text-[#06D6A0]'
                                        : 'text-[#EF476F]'
                                        }`}>
                                        {agent.status || 'Offline'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Active Alerts</span>
                                    <span className="font-mono text-sm font-bold text-white flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4 text-[#A066FF]" />
                                        {agentAlerts.length}
                                    </span>
                                </div>
                            </div>

                            {/* Alerts List */}
                            <div className="flex-1 min-h-[150px] flex flex-col gap-2 mt-2">
                                <h4 className="text-xs text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Recent Detections
                                </h4>

                                {agentAlerts.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-sm text-gray-500 font-mono italic bg-black/10 rounded-lg border border-white/5 py-8">
                                        No active alerts detected.
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                                        {agentAlerts.map((alert, idx) => (
                                            <div
                                                key={alert.id || idx}
                                                className={`p-3 rounded-lg border flex flex-col gap-1 text-sm bg-black/40 ${alert.severity === 'CRITICAL' ? 'border-[#EF476F]/30 border-l-2 border-l-[#EF476F]' :
                                                    ['HIGH', 'MEDIUM'].includes(alert.severity) ? 'border-[#FFD166]/30 border-l-2 border-l-[#FFD166]' :
                                                        'border-[#06D6A0]/30 border-l-2 border-l-[#06D6A0]'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <span className="font-mono text-white text-xs break-all pr-2">
                                                        {alert.attackType || alert.ai_attack_type || 'Unknown Event'}
                                                    </span>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/50 border ${alert.severity === 'CRITICAL' ? 'text-[#EF476F] border-[#EF476F]/50' :
                                                        ['HIGH', 'MEDIUM'].includes(alert.severity) ? 'text-[#FFD166] border-[#FFD166]/50' :
                                                            'text-[#06D6A0] border-[#06D6A0]/50'
                                                        }`}>
                                                        {alert.severity}
                                                    </span>
                                                </div>
                                                {alert.sourceIp && (
                                                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                                                        Target/Src: {alert.sourceIp}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
