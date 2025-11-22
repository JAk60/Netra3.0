import { Download } from 'lucide-react';
import { ArrowLeft, Edit } from 'lucide-react';
import { glassCard } from './data';
import { Config } from './data';

interface ConfigViewerProps {
  config: Config;
  onBack: () => void;
  onEdit: (config: Config) => void;
}

export default function ConfigViewer({ config, onBack, onEdit }: ConfigViewerProps) {
  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${config.config_name.replace(/\s+/g, '_')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg transition-all text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(config)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
          >
            <Edit className="w-4 h-4" />
            Edit Configuration
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export JSON
          </button>
        </div>
      </div>

      <div className={`${glassCard} p-6`}>
        <h2 className="text-2xl font-bold text-white mb-4">{config.config_name}</h2>
        <div className="text-gray-400 mb-6">Ship: {config.ship_name}</div>

        <div className="space-y-6">
          {Object.entries(config.configuration).map(([systemKey, systemConfig]: any) => (
            <div key={systemKey} className="p-6 bg-slate-800/30 rounded-lg border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4 capitalize">
                {systemKey.replace('_', ' ')}
              </h3>
              
              <div className="mb-4">
                <div className="text-sm text-gray-400 mb-2">Selected Equipment:</div>
                <div className="flex flex-wrap gap-2">
                  {systemConfig.selected_equipment.map((eq: any) => (
                    <span key={eq.component_id} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                      {eq.nomenclature}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-3">Phase Configurations:</div>
                <div className="space-y-2">
                  {systemConfig.phases.map((phase: any) => (
                    <div key={phase.phase_number} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                      <span className="text-white font-medium">Phase {phase.phase_number}: {phase.phase_name}</span>
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-mono">
                        K={phase.k} / N={phase.n}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}