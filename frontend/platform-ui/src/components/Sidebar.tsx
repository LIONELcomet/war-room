import { NavLink } from 'react-router-dom';
import { Shield, Activity, Globe, Clock, Zap, Server } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Sidebar() {
  const navItems = [
    { name: 'Overview', path: '/', icon: Activity },
    { name: 'Threat Monitor', path: '/threat-monitor', icon: Shield },
    { name: '3D Network War Map', path: '/war-map', icon: Globe },
    { name: 'Incident Timeline', path: '/timeline', icon: Clock },
    { name: 'Response Engine', path: '/response', icon: Zap },
    { name: 'System Health', path: '/health', icon: Server },
  ];

  return (
    <div className="w-64 h-screen glass-panel flex flex-col flex-shrink-0 border-r border-[#A066FF]/20 z-10 relative">
      <div className="p-6 flex items-center gap-3 border-b border-[#A066FF]/20">
        <Shield className="w-8 h-8 text-[#A066FF] neon-text" />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-wider text-white neon-text">COMMANDROOM</h1>
          <span className="text-[10px] text-[#A066FF] uppercase tracking-widest">Cyber Defense</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  twMerge(
                    clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-[#7B3FE4]/20 text-white border border-[#A066FF]/30 shadow-[0_0_15px_rgba(160,102,255,0.2)]'
                        : 'text-gray-400 hover:text-white hover:bg-[#7B3FE4]/10'
                    )
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-[#A066FF]/20 text-xs text-gray-500 text-center font-mono">
        v2.4.1_SECURE_LINK
      </div>
    </div>
  );
}
