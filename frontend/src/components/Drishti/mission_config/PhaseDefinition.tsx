import { ArrowLeft, ArrowRight } from 'lucide-react';
import { glassCard, glassInput } from './data';

interface PhaseDefinitionProps {
  phases: any[];
  onPhasesChange: (phases: any[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function PhaseDefinition({ phases, onPhasesChange, onNext, onBack }: PhaseDefinitionProps) {
  const handlePhaseCountChange = (count: number) => {
    const newPhases = Array.from({ length: count }, (_, i) => ({
      phase_number: i + 1,
      phase_name: phases[i]?.phase_name || ''
    }));
    onPhasesChange(newPhases);
  };

  const handlePhaseNameChange = (idx: number, name: string) => {
    const newPhases = [...phases];
    newPhases[idx] = { ...newPhases[idx], phase_name: name };
    onPhasesChange(newPhases);
  };

  return (
    <div className={`${glassCard} p-8 space-y-6`}>
      <div className="pb-4 border-b border-white/10">
        <h3 className="text-2xl font-semibold text-white">Define Operational Phases</h3>
        <p className="text-gray-400 text-sm mt-2">
          Define the operational phases that will apply to all systems
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Number of Phases</label>
        <input
          type="number"
          min="1"
          max="10"
          value={phases.length}
          onChange={(e) => handlePhaseCountChange(parseInt(e.target.value) || 1)}
          className={glassInput}
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">Phase Names</label>
        {phases.map((phase: any, idx: number) => (
          <div key={idx} className="flex items-center gap-4">
            <div className="w-24 px-4 py-2 bg-slate-700/50 rounded-lg text-white font-medium text-center">
              Phase {phase.phase_number}
            </div>
            <input
              type="text"
              value={phase.phase_name}
              onChange={(e) => handlePhaseNameChange(idx, e.target.value)}
              placeholder="e.g., Port Operations, Transit, Combat"
              className={`${glassInput} flex-1`}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 border-t border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Ship Selection
        </button>
        <button
          onClick={onNext}
          disabled={phases.some((p: any) => !p.phase_name.trim())}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
        >
          Next: Configure Systems
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}