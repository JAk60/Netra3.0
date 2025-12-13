"use client";

import { createRCMBulk, getRcmData } from "@/actions/rcm";
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { useEffect, useState } from 'react';
import { questionTree } from './questionsFlow';
import QuestionnaireView from './QuestionnaireView';
import ReportView from './ReportView';
import SummaryView from './SummaryView';
import RCMRecordTable from './rcm_record_table';

interface AssemblyOption {
    value: string;
    label: string;
    parentEquipmentId: string;
}

interface RCMAnalysisProps {
    selectedShip: string;
    selectedEquipmentIds: string[];
    selectedAssemblyIds: string[];
    assemblyOptions: AssemblyOption[];
    equipmentGroups: any[];
}

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

export default function RCMAnalysis({
    selectedShip,
    selectedEquipmentIds,
    selectedAssemblyIds,
    assemblyOptions,
    equipmentGroups
}: RCMAnalysisProps) {
    const [currentStep, setCurrentStep] = useState<"questionnaire" | "summary" | "report">("questionnaire");
    const [currentQuestionId, setCurrentQuestionId] = useState("q1");
    const [answers, setAnswers] = useState<any[]>([]);
    const [questionHistory, setQuestionHistory] = useState(["q1"]);

    // Table state
    const [rcmRecords, setRcmRecords] = useState<RCMRecord[]>([]);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const { getShipLabel, getEquipmentLabel } = useUserSelectionStore();

    // Fetch RCM records
    useEffect(() => {
        async function fetchRCMRecords() {
            if (!selectedShip) return;

            setLoading(true);
            const result = await getRcmData(selectedShip);

            if (result.success && result.data) {
                setRcmRecords(result.data);
            }
            setLoading(false);
        }

        fetchRCMRecords();
    }, [selectedShip]);

    if (!selectedShip || selectedEquipmentIds.length === 0 || selectedAssemblyIds.length === 0) {
        return (
            <div className="min-h-[400px] w-full bg-muted/30 rounded-xl p-8 border border-gray-800 flex items-center justify-center">
                <p className="text-gray-500 text-center">
                    Please select a ship, equipment, and assemblies above to start the RCM analysis.
                </p>
            </div>
        );
    }

    const currentQuestion = questionTree[currentQuestionId];
    const progress = Math.min((answers.length / 10) * 100, 100);

    const handleAnswer = (answer: string) => {
        const ansObj = {
            questionId: currentQuestionId,
            question: currentQuestion.question,
            answer
        };

        setAnswers(prev => [...prev, ansObj]);

        const nextId = answer === "yes" ? currentQuestion.yesPath : currentQuestion.noPath;
        const nextNode = questionTree[nextId];

        if (nextNode.type === "endpoint") {
            setCurrentStep("summary");
        } else {
            setCurrentQuestionId(nextId);
            setQuestionHistory(prev => [...prev, nextId]);
        }
    };

    const handleBack = () => {
        if (questionHistory.length <= 1) return;

        const newHistory = [...questionHistory];
        newHistory.pop();

        setQuestionHistory(newHistory);
        setCurrentQuestionId(newHistory[newHistory.length - 1]);

        setAnswers(prev => prev.slice(0, -1));
    };

    const getEndpointResult = () => {
        const last = answers[answers.length - 1];
        const node = questionTree[last.questionId];
        const next = questionTree[last.answer === "yes" ? node.yesPath : node.noPath];
        return next.result;
    };

    const buildBulkPayload = () => {
        const maintenance_policy = getEndpointResult();

        return selectedAssemblyIds.map(asmId => {
            const asm = assemblyOptions.find(a => a.value === asmId);

            return {
                component_id: asm?.value || "",
                decision_path: { steps: answers },
                maintenance_policy
            };
        });
    };

    const handleGenerateReport = async () => {
        const payload = buildBulkPayload();

        const res = await createRCMBulk(payload);

        if (!res.success) {
            alert("Failed to save RCM analysis: " + res.error);
            return;
        }

        console.log("RCM Saved:", res.data);

        // Refresh the table
        const result = await getRcmData(selectedShip);
        if (result.success && result.data) {
            setRcmRecords(result.data);
        }

        setCurrentStep("report");
    };

    const handleStartNew = () => {
        setAnswers([]);
        setQuestionHistory(["q1"]);
        setCurrentQuestionId("q1");
        setCurrentStep("questionnaire");
    };

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleDownloadReport = (record: RCMRecord) => {
        // Create a formatted report
        const reportContent = `
RCM ANALYSIS REPORT
===================

Ship: ${getShipLabel(selectedShip)}
Component: ${record.component_name} (${record.nomenclature})
Component ID: ${record.component_id}
Maintenance Policy: ${record.maintenance_policy}
Analysis Date: ${new Date(record.created_date).toLocaleString()}
Last Modified: ${new Date(record.modified_date).toLocaleString()}

DECISION PATH:
--------------
${record.decision_path.steps.map((step, idx) =>
            `${idx + 1}. ${step.question}\n   Answer: ${step.answer.toUpperCase()}`
        ).join('\n\n')}

RECOMMENDATION:
---------------
${record.maintenance_policy}

REPORT DETAILS:
---------------
RCM ID: ${record.rcm_id}
Generated: ${new Date().toLocaleString()}
        `.trim();

        // Create and download file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RCM_Report_${record.nomenclature}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const onDownloadAllReports =()=>{
        alert("downlaod here")
    }

    return (
        <div className="space-y-6">
            <div className="min-h-screen w-full bg-muted/30 rounded-xl p-6 border border-gray-800">
                {currentStep === "questionnaire" && (
                    <>
                    <QuestionnaireView
                        currentQuestion={currentQuestion}
                        progress={progress}
                        canGoBack={questionHistory.length > 1}
                        onAnswer={handleAnswer}
                        onBack={handleBack}
                        />
                        {/* RCM Records Table */}
                        <RCMRecordTable
                            rcmRecords={rcmRecords}
                            loading={loading}
                            selectedShip={selectedShip}
                            getShipLabel={getShipLabel}
                            onDownloadReport={handleDownloadReport}
                            onDownloadAllReports={onDownloadAllReports}
                        />
                        </>
                )}

                {currentStep === "summary" && (
                    <SummaryView
                        selectedShip={selectedShip}
                        selectedEquipmentIds={selectedEquipmentIds}
                        selectedAssemblyIds={selectedAssemblyIds}
                        assemblyOptions={assemblyOptions}
                        answers={answers}
                        getShipLabel={getShipLabel}
                        getEquipmentLabel={getEquipmentLabel}
                        onGenerateReport={handleGenerateReport}
                    />
                )}

                {currentStep === "report" && (
                    <ReportView
                        selectedShip={selectedShip}
                        selectedEquipmentIds={selectedEquipmentIds}
                        selectedAssemblyIds={selectedAssemblyIds}
                        assemblyOptions={assemblyOptions}
                        equipmentGroups={equipmentGroups}
                        answers={answers}
                        recommendation={getEndpointResult()}
                        getShipLabel={getShipLabel}
                        getEquipmentLabel={getEquipmentLabel}
                        onStartNew={handleStartNew}
                    />
                )}
            </div>

       
        </div>
    );
}