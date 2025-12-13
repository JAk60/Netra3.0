interface AssemblyOption {
    value: string;
    label: string;
    parentEquipmentId: string;
}

interface Answer {
    questionId: string;
    question: string;
    answer: string;
}

interface SummaryViewProps {
    selectedShip: string;
    selectedEquipmentIds: string[];
    selectedAssemblyIds: string[];
    assemblyOptions: AssemblyOption[];
    answers: Answer[];
    getShipLabel: (shipId: string) => string;
    getEquipmentLabel: (shipId: string, equipmentId: string) => string;
    onGenerateReport: () => void;
}

export default function SummaryView({
    selectedShip,
    selectedEquipmentIds,
    selectedAssemblyIds,
    assemblyOptions,
    answers,
    getShipLabel,
    getEquipmentLabel,
    onGenerateReport
}: SummaryViewProps) {
    const getSelectedAssemblyLabels = () =>
        selectedAssemblyIds
            .map(id => assemblyOptions.find(a => a.value === id)?.label)
            .filter(Boolean)
            .join(", ");

    return (
        <div className="space-y-6">
            <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
                <h2 className="text-2xl font-light mb-6">Analysis Summary</h2>

                {/* Summary Details */}
                <div className="space-y-4 mb-6">
                    <div className="flex justify-between border-b border-gray-800 pb-2">
                        <span className="text-gray-500">Ship</span>
                        <span>{getShipLabel(selectedShip)}</span>
                    </div>
                </div>

                {/* Decision Path */}
                <h3 className="text-lg font-light mb-4 text-gray-400">Decision Path</h3>
                <div className="bg-muted/30 p-6 rounded-lg border border-gray-800">
                    <div className="flex flex-wrap gap-2 text-sm">
                        {answers.map((a, i) => (
                            <span key={i} className="inline-flex items-center">
                                <span className="text-gray-400">{a.question}</span>
                                <span
                                    className={`mx-2 px-2 py-0.5 rounded text-xs ${
                                        a.answer === "yes"
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-rose-500/20 text-rose-400"
                                    }`}
                                >
                                    {a.answer.toUpperCase()}
                                </span>
                                {i < answers.length - 1 && (
                                    <span className="text-gray-500">→</span>
                                )}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Generate Report Button */}
                <button
                    onClick={onGenerateReport}
                    className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-white py-4 rounded-lg transition-colors"
                >
                    Generate Report
                </button>
            </div>
        </div>
    );
}