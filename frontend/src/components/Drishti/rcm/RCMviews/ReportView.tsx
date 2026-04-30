import { Download } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { RCMReportPDF } from './pdf/RCMReportPDF';

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

interface ReportViewProps {
    selectedShip: string;
    selectedEquipmentIds: string[];
    selectedAssemblyIds: string[];
    assemblyOptions: AssemblyOption[];
    equipmentGroups: any[];
    answers: Answer[];
    recommendation: string;
    getShipLabel: (shipId: string) => string;
    getEquipmentLabel: (shipId: string, equipmentId: string) => string;
    onStartNew: () => void;
}

export default function ReportView({
    selectedShip,
    selectedEquipmentIds,
    selectedAssemblyIds,
    assemblyOptions,
    equipmentGroups,
    answers,
    recommendation,
    getShipLabel,
    getEquipmentLabel,
    onStartNew
}: ReportViewProps) {
    const getSelectedAssemblyLabels = () =>
        selectedAssemblyIds
            .map(id => assemblyOptions.find(a => a.value === id)?.label)
            .filter(Boolean)
            .join(", ");

    const handleDownloadPDF = async () => {
        try {
            const rows = selectedAssemblyIds.map(id => {
                const asm = assemblyOptions.find(a => a.value === id);

                const equipmentName =
                    equipmentGroups
                        .flatMap(group => group.items)
                        .find(item => item.value === asm?.parentEquipmentId)?.label
                    || "Unknown Equipment";

                return {
                    equipment: equipmentName,
                    assembly: asm?.label || "",
                    recommendation: recommendation
                };
            });

            const blob = await pdf(
                <RCMReportPDF
                    shipName={getShipLabel(selectedShip)}
                    equipmentNames={selectedEquipmentIds.map(eq => 
                        getEquipmentLabel(selectedShip, eq)
                    )}
                    tableRows={rows}
                    answers={answers}
                    generatedDate={new Date().toLocaleDateString()}
                    generatedTime={new Date().toLocaleTimeString()}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `RCM-Analysis-${selectedShip}-${Date.now()}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            alert("PDF generation failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-3xl font-light mb-2">RCM Analysis Report</h2>
                        <p className="text-gray-500 text-sm">
                            Generated on {new Date().toLocaleDateString()} at{" "}
                            {new Date().toLocaleTimeString()}
                        </p>
                    </div>

                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download RCM Report
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="space-y-6 mb-8">
                    <div className="bg-muted/30 p-6 rounded-lg border border-gray-800">
                        <h3 className="text-sm text-gray-500 mb-1">Ship</h3>
                        <p className="text-xl text-white">{getShipLabel(selectedShip)}</p>
                    </div>
                </div>

                {/* Results Table */}
                <div className="border border-gray-800 rounded-lg overflow-hidden mb-10">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800 text-gray-300">
                            <tr>
                                <th className="p-3">Equipment</th>
                                <th className="p-3">Assembly</th>
                                <th className="p-3">Maintenance Policy</th>
                            </tr>
                        </thead>

                        <tbody>
                            {selectedAssemblyIds.map(id => {
                                const asm = assemblyOptions.find(a => a.value === id);

                                const equipmentName =
                                    equipmentGroups
                                        .flatMap(group => group.items)
                                        .find(item => item.value === asm?.parentEquipmentId)?.label
                                    || "Unknown Equipment";

                                return (
                                    <tr key={id} className="border-t border-gray-700">
                                        <td className="p-3">{equipmentName}</td>
                                        <td className="p-3">{asm?.label}</td>
                                        <td className="p-3">{recommendation}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Decision Path — commented out, not needed
                <div className="mb-8">
                    <h3 className="text-lg font-light mb-4 text-gray-400">Decision Path</h3>

                    <div className="bg-muted/30 p-6 rounded-lg border border-gray-800 overflow-x-auto">
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
                                        <span className="text-gray-600 mx-2">→</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                */}

                {/* Start New Button */}
                <button
                    onClick={onStartNew}
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white py-4 rounded-lg transition-colors"
                >
                    Start New Analysis
                </button>
            </div>
        </div>
    );
}