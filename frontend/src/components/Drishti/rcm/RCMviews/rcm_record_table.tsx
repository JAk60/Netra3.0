import { useState } from 'react';
import { ChevronDown, FileCog, Download } from 'lucide-react';

interface RCMRecord {
    rcm_id: string;
    component_id: string;
    component_name: string;
    nomenclature: string;
    maintenance_policy: string;
    decision_path: {
        steps: Array<{
            questionId: string;
            question: string;
            answer: string;
        }>;
    };
    created_date: string;
    modified_date: string;
    ship_id: string;
}

interface RCMRecordTableProps {
    rcmRecords: RCMRecord[];
    loading: boolean;
    selectedShip: string;
    getShipLabel: (shipId: string) => string;
    onDownloadReport: (record: RCMRecord) => void;
    onDownloadAllReports?: () => void;
}

export default function RCMRecordTable({
    rcmRecords,
    loading,
    selectedShip,
    getShipLabel,
    onDownloadReport,
    onDownloadAllReports
}: RCMRecordTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <div className="w-full bg-muted/30 rounded-xl border border-gray-800 overflow-hidden mt-8">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold">Previous RCM Analyses</h2>
                <p className="text-sm text-gray-500 mt-1">
                    {rcmRecords.length} record{rcmRecords.length !== 1 ? 's' : ''} found for this ship
                </p>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">
                    Loading RCM records...
                </div>
            ) : rcmRecords.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    No RCM analyses found for this ship yet.
                </div>
            ) : (
                <div className="divide-y divide-gray-800">
                    {rcmRecords.map((record) => (
                        <div key={record.rcm_id} className="bg-black">
                            {/* Row Header */}
                            <div
                                onClick={() => toggleRow(record.rcm_id)}
                                className="w-full px-4 py-4 flex items-center justify-between hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                                {/* LEFT SIDE */}
                                <div className="flex items-center gap-4 flex-1">
                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-400 transition-transform ${expandedRows.has(record.rcm_id) ? "rotate-180" : ""
                                            }`}
                                    />

                                    <div className="text-left">
                                        <div className="font-medium">{record.component_name} {record.nomenclature}</div>
                                        <div className="text-sm text-gray-500">
                                             •{" "}
                                            {new Date(record.modified_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* MIDDLE BADGE */}
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm mx-4">
                                    {record.maintenance_policy}
                                </span>

                                {/* RIGHT SIDE */}
                                <div className="flex items-center justify-end">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDownloadReport(record);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#25547e] hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <FileCog className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Content */}
                            {expandedRows.has(record.rcm_id) && (
                                <div className="px-4 pb-4 border-t border-gray-800/50">
                                    <div className="mt-4 space-y-3">
                                        <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
                                            Decision Path
                                        </h3>
                                        {record.decision_path.steps.map((step, idx) => (
                                            <div
                                                key={idx}
                                                className="pl-4 border-l-2 border-blue-500/30 py-2"
                                            >
                                                <div className="text-sm font-medium">
                                                    {idx + 1}. {step.question}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">
                                                    <span
                                                        className={`font-semibold ${step.answer.toLowerCase() === 'yes'
                                                            ? 'text-green-400'
                                                            : 'text-red-400'
                                                            }`}
                                                    >
                                                        {step.answer.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Download All Reports Button */}
            {!loading && rcmRecords.length > 0 && (
                <div className="p-4 border-t border-gray-800 bg-muted/10">
                    <button
                        onClick={onDownloadAllReports}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25547e] hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all font-medium"
                    >
                        <Download className="w-5 h-5" />
                        Download All Reports ({rcmRecords.length} records)
                    </button>
                </div>
            )}
        </div>
    );
}