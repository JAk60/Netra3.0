import { Ship } from 'lucide-react';
// Header Component
export default function Header() {
    // Glassmorphism utility classes
const glassCard = "bg-slate-900/75 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl";
const glassInput = "bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50";

  return (
    <header className={`${glassCard} p-6 mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Ship className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Ship Configuration Manager</h1>
            <p className="text-gray-400 text-sm mt-1">Equipment redundancy & phase management system</p>
          </div>
        </div>
      </div>
    </header>
  );
}