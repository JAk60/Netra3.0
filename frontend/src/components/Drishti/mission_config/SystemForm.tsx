import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { glassCard, glassInput } from './data';

interface SystemFormProps {
  systemKey: string;
  systemData: any;
  selectedEquipment: any;
  onEquipmentChange: (systemKey: string, equipment: any[]) => void;
  globalPhases: any[];
  knConfigs: any;
  onKNChange: (systemKey: string, knConfigs: any[]) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export default function SystemForm({ 
  systemKey, 
  systemData, 
  selectedEquipment, 
  onEquipmentChange, 
  globalPhases,
  knConfigs,
  onKNChange,
  onNext,
  onBack,
  isFirst,
  isLast
}: SystemFormProps) {
  const systemLabels: Record<string, string> = {
    propulsion: 'Propulsion',
    power_generation: 'Power Generation',
    support: 'Support',
    firing: 'Firing'
  };

  const handleEquipmentToggle = (component: any) => {
    const current = selectedEquipment[systemKey] || [];
    const exists = current.find((eq: any) => eq.component_id === component.component_id);
    
    if (exists) {
      onEquipmentChange(systemKey, current.filter((eq: any) => eq.component_id !== component.component_id));
    } else {
      onEquipmentChange(systemKey, [...current, component]);
    }
  };

  const handleKChange = (phaseNumber: number, k: number) => {
    const currentConfigs = knConfigs[systemKey] || [];
    const newConfigs = [...currentConfigs];
    const idx = newConfigs.findIndex((c: any) => c.phase_number === phaseNumber);
    
    if (idx >= 0) {
      newConfigs[idx] = { phase_number: phaseNumber, k };
    } else {
      newConfigs.push({ phase_number: phaseNumber, k });
    }
    
    onKNChange(systemKey, newConfigs);
  };

  const getKValue = (phaseNumber: number) => {
    const config = (knConfigs[systemKey] || []).find((c: any) => c.phase_number === phaseNumber);
    return config?.k || 0;
  };

  const selectedCount = (selectedEquipment[systemKey] || []).length;

  return (
    <div className={`${glassCard} p-6 space-y-6`}>
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <h3 className="text-2xl font-semibold text-white">{systemLabels[systemKey]}</h3>
        <span className="text-sm text-gray-400">System {Object.keys(systemLabels).indexOf(systemKey) + 1} of 4</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Select Equipment</label>
        <div className="grid grid-cols-2 gap-3">
          {systemData.components.map((component: any) => {
            const isSelected = (selectedEquipment[systemKey] || []).some(
              (eq: any) => eq.component_id === component.component_id
            );
            return (
              <button
                key={component.component_id}
                onClick={() => handleEquipmentToggle(component)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/10 bg-slate-800/30 hover:border-white/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{component.nomenclature}</div>
                    <div className="text-xs text-gray-400">{component.component_name}</div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-blue-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">K/N Configuration per Phase</label>
          <p className="text-xs text-gray-400">Define how many equipment units (K) should be active out of total selected (N) for each phase</p>
          {globalPhases.map((phase: any) => (
            <div key={phase.phase_number} className="p-4 bg-slate-800/30 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-white mb-1">Phase {phase.phase_number}: {phase.phase_name}</div>
                  <div className="text-xs text-gray-400">Active equipment required</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-400">K (Active):</div>
                  <input
                    type="number"
                    min="0"
                    max={selectedCount}
                    value={getKValue(phase.phase_number)}
                    onChange={(e) => handleKChange(phase.phase_number, parseInt(e.target.value) || 0)}
                    className={`${glassInput} w-20 text-center`}
                  />
                  <span className="text-gray-400">/</span>
                  <div className="px-4 py-2 bg-slate-700/50 rounded-lg text-white font-mono">
                    N = {selectedCount}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-white/10">
        <button
          onClick={onBack}
          disabled={isFirst}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedCount === 0}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
        >
          {isLast ? 'Complete Configuration' : 'Next System'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}