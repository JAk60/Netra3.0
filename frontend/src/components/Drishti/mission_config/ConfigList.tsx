import { Plus, Edit, Trash2, Eye, Copy, Ship } from 'lucide-react';
import { Config, glassCard ,glassInput} from './data';

interface ConfigListProps {
  configs: Config[];
  onView: (config: Config) => void;
  onEdit: (config: Config) => void;
  onDelete: (id: string) => void;
  onDuplicate: (config: Config) => void;
  onCreate: () => void;
}

export default function ConfigList({ configs, onView, onEdit, onDelete, onDuplicate, onCreate }: ConfigListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Saved Configurations</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
        >
          <Plus className="w-5 h-5" />
          Create New Configuration
        </button>
      </div>

      {configs.length === 0 ? (
        <div className={`${glassCard} p-12 text-center`}>
          <Ship className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No configurations yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {configs.map((config: Config) => (
            <div key={config.id} className={`${glassCard} p-6 hover:border-blue-500/30 transition-all duration-200`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">{config.config_name}</h3>
                  <div className="flex gap-4 text-sm text-gray-400 mb-3">
                    <span>Ship: {config.ship_name}</span>
                    <span>•</span>
                    <span>Created: {new Date(config.created_date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Modified: {new Date(config.modified_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full">
                      {Object.keys(config.configuration).length} Systems
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full">
                      {Object.values(config.configuration).reduce((acc: number, sys: any) => acc + sys.selected_equipment.length, 0)} Equipment
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onView(config)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={() => onEdit(config)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={() => onDuplicate(config)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                  <button
                    onClick={() => onDelete(config.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
