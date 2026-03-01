"use client";

import { createRCMBulk, getRcmData } from "@/actions/rcm";
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { useEffect, useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { RCMReportPDF } from './pdf/RCMReportPDF';
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

    const [rcmRecords, setRcmRecords] = useState<RCMRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const { getShipLabel, getEquipmentLabel } = useUserSelectionStore();

    // ── Fetch RCM records ────────────────────────────────────────────────────
    useEffect(() => {
        async function fetchRCMRecords() {
            if (!selectedShip) return;
            setLoading(true);
            const result = await getRcmData(selectedShip);
            if (result.success && result.data) {
                const filtered = selectedAssemblyIds.length > 0
                    ? result.data.filter((r: RCMRecord) => selectedAssemblyIds.includes(r.component_id))
                    : result.data;
                setRcmRecords(filtered);
            }
            setLoading(false);
        }
        fetchRCMRecords();
    }, [selectedShip, selectedAssemblyIds]);

    if (!selectedShip || selectedEquipmentIds.length === 0 || selectedAssemblyIds.length === 0) {
        return (
            <div className="min-h-[400px] w-full bg-muted/30 rounded-xl p-8 border border-gray-800 flex items-center justify-center">
                <p className="text-gray-200 text-center">
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
        const result = await getRcmData(selectedShip);
        if (result.success && result.data) {
            const filtered = selectedAssemblyIds.length > 0
                ? result.data.filter((r: RCMRecord) => selectedAssemblyIds.includes(r.component_id))
                : result.data;
            setRcmRecords(filtered);
        }
        setCurrentStep("report");
    };

    const handleStartNew = () => {
        setAnswers([]);
        setQuestionHistory(["q1"]);
        setCurrentQuestionId("q1");
        setCurrentStep("questionnaire");
    };

    // ── Individual PDF ────────────────────────────────────────────────────────
    // Single ship always — ship shown in header, no Ship column in table
    const handleDownloadReport = async (record: RCMRecord) => {
        try {
            const shipName = getShipLabel(selectedShip) || record.ship_id || 'Unknown Ship';
            const now = new Date();

            const tableRows = [{
                equipment: record.component_name || 'N/A',
                assembly: record.nomenclature,
                recommendation: record.maintenance_policy || 'N/A',
                // ✅ No shipName — single ship, already in header
            }];

            const stepAnswers = record.decision_path?.steps?.map(step => ({
                question: step.question,
                answer: step.answer,
            })) || [];

            const blob = await pdf(
                <RCMReportPDF
                    shipName={shipName}
                    equipmentNames={[record.component_name || record.nomenclature]}
                    tableRows={tableRows}
                    answers={stepAnswers}
                    generatedDate={now.toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                    generatedTime={now.toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                    })}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `RCM_Report_${record.nomenclature}_${now.toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // ── Download All PDF ──────────────────────────────────────────────────────
    // All records from same selectedShip — ship in header, shipName per row for table clarity
    const onDownloadAllReports = async () => {
        if (rcmRecords.length === 0) return;
        try {
            const shipName = getShipLabel(selectedShip) || 'Unknown Ship';
            const now = new Date();

            const equipmentNames = Array.from(
                new Set(rcmRecords.map(r => r.component_name || r.nomenclature))
            ) as string[];

            const tableRows = rcmRecords.map(record => ({
                equipment: record.component_name || 'N/A',
                assembly: record.nomenclature,
                recommendation: record.maintenance_policy || 'N/A',
                // ✅ Resolved ship name per row
                shipName: getShipLabel(record.ship_id) || record.ship_id || 'Unknown Ship',
            }));

            const allAnswers = rcmRecords.flatMap(record =>
                (record.decision_path?.steps || []).map(step => ({
                    question: `[${record.component_name || record.nomenclature}] ${step.question}`,
                    answer: step.answer,
                }))
            );

            const blob = await pdf(
                <RCMReportPDF
                    shipName={shipName}
                    equipmentNames={equipmentNames}
                    tableRows={tableRows}
                    answers={allAnswers}
                    generatedDate={now.toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                    generatedTime={now.toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit'
                    })}
                />
            ).toBlob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `RCM_All_Reports_${selectedShip}_${now.toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating consolidated PDF:', error);
            alert('Failed to generate consolidated PDF. Please try again.');
        }
    };

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