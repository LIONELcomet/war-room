import { WarMap3D } from '../components/WarMap3D';
import { motion } from 'motion/react';
import { Globe } from 'lucide-react';

export function WarMapPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col gap-4"
    >
      <div className="flex items-center justify-between border-b border-[#A066FF]/20 pb-4">
        <h2 className="text-xl font-bold tracking-widest text-white neon-text uppercase flex items-center gap-3">
          <Globe className="w-6 h-6 text-[#A066FF] neon-text" />
          3D Network War Map
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#06D6A0] shadow-[0_0_10px_#06D6A0] animate-pulse" />
          <span className="text-xs text-[#06D6A0] font-mono uppercase tracking-widest">Live Topology</span>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <WarMap3D />
      </div>
    </motion.div>
  );
}
