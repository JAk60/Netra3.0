import { useState } from 'react';
import ConfigList from './ConfigList';
import ConfigViewer from './ConfigViewer';
import { Config, glassCard, glassInput, MOCK_SHIP_DATA, ViewMode } from './data';
import FlowCanvas from './FlowCanvas';
import Header from './Header';
import PhaseDefinition from './PhaseDefinition';
import SystemForm from './SystemForm';
interface ShipSelectorProps {
    selectedShipId: string;
    onShipChange: (shipId: string) => void;
    onLoad: () => void;
}

function ShipSelector({ selectedShipId, onShipChange, onLoad }: ShipSelectorProps) {
    return (
        <div className={`${glassCard} p-8`}>
            <h2 className="text-2xl font-semibold text-white mb-6">Select Ship</h2>
            <div className="space-y-4">
                <select
                    value={selectedShipId}
                    onChange={(e) => onShipChange(e.target.value)}
                    className={`${glassInput} w-full`}
                >
                    <option value="">Choose a ship...</option>
                    {Object.entries(MOCK_SHIP_DATA).map(([id, data]: any) => (
                        <option key={id} value={id}>{data.ship_name}</option>
                    ))}
                </select>
                <button
                    onClick={onLoad}
                    disabled={!selectedShipId}
                    className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                >
                    Load Ship & Start Configuration
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN APP
// ============================================================================
export default function Mission_Configuration() {
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [configs, setConfigs] = useState<Config[]>([]);
    const [selectedConfig, setSelectedConfig] = useState<Config | null>(null);
    const [selectedShipId, setSelectedShipId] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedEquipment, setSelectedEquipment] = useState<any>({});
    const [globalPhases, setGlobalPhases] = useState([
        { phase_number: 1, phase_name: '' }
    ]);
    const [systemKNConfigs, setSystemKNConfigs] = useState<any>({});

    const systems = ['propulsion', 'power_generation', 'support', 'firing'];
    const currentSystemIndex = currentStep - 2;
    const currentSystem = currentSystemIndex >= 0 ? systems[currentSystemIndex] : null;

    const handleCreateNew = () => {
        setViewMode('create');
        setSelectedConfig(null);
        setSelectedShipId('');
        setCurrentStep(0);
        setSelectedEquipment({});
        setGlobalPhases([{ phase_number: 1, phase_name: '' }]);
        setSystemKNConfigs({});
    };

    const handleLoadShip = () => {
        if (!selectedShipId) return;
        setCurrentStep(1);
    };

    const handlePhasesNext = () => {
        const initialConfigs: any = {};
        systems.forEach(sys => {
            initialConfigs[sys] = globalPhases.map(p => ({
                phase_number: p.phase_number,
                k: 0
            }));
        });
        setSystemKNConfigs(initialConfigs);
        setCurrentStep(2);
    };

    const handleEquipmentChange = (systemKey: string, equipment: any[]) => {
        setSelectedEquipment((prev: any) => ({ ...prev, [systemKey]: equipment }));
    };

    const handleKNChange = (systemKey: string, knConfigs: any[]) => {
        setSystemKNConfigs((prev: any) => ({ ...prev, [systemKey]: knConfigs }));
    };

    const handleSystemNext = () => {
        if (currentSystemIndex < systems.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            const name = prompt('Enter configuration name:');
            if (name) {
                const newConfig: Config = {
                    id: Date.now().toString(),
                    config_name: name,
                    ship_id: selectedShipId,
                    ship_name: MOCK_SHIP_DATA[selectedShipId].ship_name,
                    created_date: new Date().toISOString(),
                    modified_date: new Date().toISOString(),
                    configuration: {}
                };

                systems.forEach(sys => {
                    const knConfigs = systemKNConfigs[sys] || [];
                    newConfig.configuration[sys] = {
                        system_id: MOCK_SHIP_DATA[selectedShipId].systems[sys].system_id,
                        selected_equipment: selectedEquipment[sys] || [],
                        phases: globalPhases.map(gp => {
                            const kn = knConfigs.find((c: any) => c.phase_number === gp.phase_number);
                            return {
                                phase_number: gp.phase_number,
                                phase_name: gp.phase_name,
                                k: kn?.k || 0,
                                n: (selectedEquipment[sys] || []).length
                            };
                        })
                    };
                });

                setConfigs([...configs, newConfig]);
                setViewMode('list');
            }
        }
    };

    const handleSystemBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleView = (config: Config) => {
        setSelectedConfig(config);
        setViewMode('view');
    };

    const handleEdit = (config: Config) => {
        setSelectedConfig(config);
        setSelectedShipId(config.ship_id);
        setCurrentStep(1);

        const firstSystem: any = Object.values(config.configuration)[0];
        if (firstSystem && firstSystem.phases) {
            setGlobalPhases(firstSystem.phases.map((p: any) => ({
                phase_number: p.phase_number,
                phase_name: p.phase_name
            })));
        }

        const equipment: any = {};
        const knConfigs: any = {};
        Object.entries(config.configuration).forEach(([sys, data]: any) => {
            equipment[sys] = data.selected_equipment;
            knConfigs[sys] = data.phases.map((p: any) => ({
                phase_number: p.phase_number,
                k: p.k
            }));
        });
        setSelectedEquipment(equipment);
        setSystemKNConfigs(knConfigs);
        setViewMode('create');
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this configuration?')) {
            setConfigs(configs.filter(c => c.id !== id));
        }
    };

    const handleDuplicate = (config: Config) => {
        const newConfig = {
            ...config,
            id: Date.now().toString(),
            config_name: `Copy of ${config.config_name}`,
            created_date: new Date().toISOString(),
            modified_date: new Date().toISOString()
        };
        setConfigs([...configs, newConfig]);
    };

    const shipData = selectedShipId ? MOCK_SHIP_DATA[selectedShipId] : null;

    return (
        <div className="w-full bg-muted/30 min-h-screen p-6 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <Header />

                {viewMode === 'list' && (
                    <ConfigList
                        configs={configs}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onCreate={handleCreateNew}
                    />
                )}

                {viewMode === 'create' && currentStep === 0 && (
                    <ShipSelector
                        selectedShipId={selectedShipId}
                        onShipChange={setSelectedShipId}
                        onLoad={handleLoadShip}
                    />
                )}

                {viewMode === 'create' && selectedShipId && currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-white">
                                Configuring: {MOCK_SHIP_DATA[selectedShipId].ship_name}
                            </h2>
                            <button
                                onClick={() => {
                                    if (confirm('Abandon current configuration?')) {
                                        setViewMode('list');
                                    }
                                }}
                                className="px-4 py-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="text-white bg-red-500 p-4">DEBUG: Step 1 - Phase Definition</div>
                        <PhaseDefinition
                            phases={globalPhases}
                            onPhasesChange={setGlobalPhases}
                            onNext={handlePhasesNext}
                            onBack={() => setCurrentStep(0)}
                        />
                    </div>
                )}

                {viewMode === 'create' && selectedShipId && currentStep >= 2 && shipData && currentSystem && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-semibold text-white">
                                Configuring: {shipData.ship_name}
                            </h2>
                            <button
                                onClick={() => {
                                    if (confirm('Abandon current configuration?')) {
                                        setViewMode('list');
                                    }
                                }}
                                className="px-4 py-2 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>

                        <FlowCanvas
                            shipData={shipData}
                            selectedEquipment={selectedEquipment}
                            currentSystemIndex={currentSystemIndex}
                        />

                        <SystemForm
                            systemKey={currentSystem}
                            systemData={shipData.systems[currentSystem]}
                            selectedEquipment={selectedEquipment}
                            onEquipmentChange={handleEquipmentChange}
                            globalPhases={globalPhases}
                            knConfigs={systemKNConfigs}
                            onKNChange={handleKNChange}
                            onNext={handleSystemNext}
                            onBack={handleSystemBack}
                            isFirst={currentSystemIndex === 0}
                            isLast={currentSystemIndex === systems.length - 1}
                        />
                    </div>
                )}

                {viewMode === 'view' && selectedConfig && (
                    <ConfigViewer
                        config={selectedConfig}
                        onBack={() => setViewMode('list')}
                        onEdit={handleEdit}
                    />
                )}
            </div>
        </div>
    );
}