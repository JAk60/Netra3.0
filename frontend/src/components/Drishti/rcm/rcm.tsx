import { Button } from '@/registry/new-york-v4/ui/button';
import { Card, CardContent } from '@/registry/new-york-v4/ui/card';
import GroupedCombobox from '@/registry/new-york-v4/ui/combo-box';
import { useUserSelectionStore } from '@/store/UserSelectionStore';
import { Activity, ChevronLeft, Download } from 'lucide-react';
import { useState } from 'react';
import { questionTree } from './questionsFlow';
import { RCMReportPDF } from './RCMReportPDF';
import { pdf } from '@react-pdf/renderer';




export default function RCMAnalysis() {
    const [selectedShip, setSelectedShip] = useState('');
    const [selectedEquipment, setSelectedEquipment] = useState('');
    const { ships, getEquipmentForShip, getShipLabel, getEquipmentLabel } = useUserSelectionStore();
    const handleShipChange = (shipId: string) => {
        setSelectedShip(shipId);
        setSelectedEquipment(''); // Reset equipment when ship changes
    };
    const handleEquipmentChange = (label: string) => {
        setSelectedEquipment(label);
    };
    const handleSubmit = () => {
        if (selectedShip && selectedEquipment) {
            setCurrentStep('questionnaire');
        }
    };
    const equipmentGroups = selectedShip ? getEquipmentForShip(selectedShip) : [];
    console.log(selectedShip, "selectedShip");

    const [currentStep, setCurrentStep] = useState('selection');
    const [currentQuestionId, setCurrentQuestionId] = useState('q1');
    const [answers, setAnswers] = useState([]);
    const [questionHistory, setQuestionHistory] = useState(['q1']);

    const currentQuestion = questionTree[currentQuestionId];
    const totalAnswered = answers.length;
    const estimatedTotal = 10;
    const progress = Math.min((totalAnswered / estimatedTotal) * 100, 100);


    const handleAnswer = (answer) => {
        const newAnswer = {
            questionId: currentQuestionId,
            question: currentQuestion.question,
            answer: answer
        };
        setAnswers([...answers, newAnswer]);

        const nextQuestionId = answer === 'yes' ? currentQuestion.yesPath : currentQuestion.noPath;
        const nextQuestion = questionTree[nextQuestionId];

        if (nextQuestion.type === 'endpoint') {
            setCurrentStep('summary');
        } else {
            setCurrentQuestionId(nextQuestionId);
            setQuestionHistory([...questionHistory, nextQuestionId]);
        }
    };

    const handleBack = () => {
        if (questionHistory.length > 1) {
            const newHistory = [...questionHistory];
            newHistory.pop();
            const previousQuestionId = newHistory[newHistory.length - 1];

            setQuestionHistory(newHistory);
            setCurrentQuestionId(previousQuestionId);
            setAnswers(answers.slice(0, -1));
        }
    };

    const handleGenerateReport = () => {
        setCurrentStep('report');
    };

    const handleDownloadPDF = async () => {
        try {
            // Generate the PDF document
            const blob = await pdf(
                <RCMReportPDF
                    shipName={getShipLabel(selectedShip)}
                    equipmentName={getEquipmentLabel(selectedShip, selectedEquipment)}
                    recommendation={getEndpointResult()}
                    answers={answers}
                    generatedDate={new Date().toLocaleDateString()}
                    generatedTime={new Date().toLocaleTimeString()}
                />
            ).toBlob();

            // Create a download link and trigger download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `RCM-Analysis-${selectedShip}-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handleStartNew = () => {
        setCurrentStep('selection');
        setSelectedShip('');
        setSelectedEquipment('');
        setCurrentQuestionId('q1');
        setAnswers([]);
        setQuestionHistory(['q1']);
    };

    const getEndpointResult = () => {
        const lastAnswer = answers[answers.length - 1];
        const nextId = lastAnswer.answer === 'yes'
            ? questionTree[lastAnswer.questionId].yesPath
            : questionTree[lastAnswer.questionId].noPath;
        return questionTree[nextId]?.result || 'Analysis Complete';
    };

    const getPathBreadcrumb = () => {
        return answers.map((a, i) => (
            <span key={i} className="inline-flex items-center">
                <span className="text-gray-400">{a.question}</span>
                <span className={`mx-2 px-2 py-0.5 rounded text-xs ${a.answer === 'yes' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                    {a.answer.toUpperCase()}
                </span>
                {i < answers.length - 1 && <span className="text-gray-600 mx-2">→</span>}
            </span>
        ));
    };

    return (
        <div className="min-h-screen w-full bg-muted/30 text-white p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-light mb-2 tracking-tight">RCM Analysis System</h1>
                    <p className="text-gray-500 text-sm">Reliability Centered Maintenance</p>
                </div>

                {/* Selection Step */}
                {currentStep === 'selection' && (
                    <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
                        <Card className='bg-muted/20'>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <GroupedCombobox
                                            label="Select Ship"
                                            placeholder={ships.length === 0 ? "Loading ships..." : "Choose a ship"}
                                            groups={ships}
                                            value={selectedShip}
                                            onValueChange={handleShipChange}
                                            disabled={ships.length === 0}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <GroupedCombobox
                                            label="Select Equipment"
                                            placeholder={!selectedShip ? "Select a ship first" : equipmentGroups.length === 0 ? "No equipment available" : "Choose equipment"}
                                            groups={equipmentGroups}
                                            value={selectedEquipment}
                                            onValueChange={handleEquipmentChange}
                                            disabled={!selectedShip || equipmentGroups.length === 0}
                                        />
                                    </div>
                                    <div className="space-y-2 flex items-end">
                                        <Button
                                            className="w-full"
                                            disabled={!selectedEquipment}
                                            onClick={handleSubmit}
                                        >
                                            <Activity className="w-4 h-4 mr-2" />
                                            Submit
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Questionnaire Step */}
                {currentStep === 'questionnaire' && (
                    <div>
                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-500">Progress</span>
                                <span className="text-cyan-400">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-[#1a1a1a] rounded-xl p-12 border border-gray-800 mb-6">
                            <div className="text-center space-y-8">
                                <h2 className="text-2xl font-light text-gray-300">
                                    {currentQuestion.question}
                                </h2>

                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => handleAnswer('yes')}
                                        className="px-12 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-all"
                                    >
                                        YES
                                    </button>
                                    <button
                                        onClick={() => handleAnswer('no')}
                                        className="px-12 py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg font-medium transition-all"
                                    >
                                        NO
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Back Button */}
                        {questionHistory.length > 1 && (
                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back to previous question
                            </button>
                        )}
                    </div>
                )}

                {/* Summary Step */}
                {currentStep === 'summary' && (
                    <div className="space-y-6">
                        <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
                            <h2 className="text-2xl font-light mb-6">Analysis Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-gray-500">Ship</span>
                                    <span className="text-white">{getShipLabel(selectedShip)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-800">
                                    <span className="text-gray-500">Equipment</span>
                                    <span className="text-white">{getEquipmentLabel(selectedShip, selectedEquipment)}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-light mb-4 text-gray-400">Your Answers</h3>
                            <div className="space-y-3 mb-8">
                                {answers.map((a, i) => (
                                    <div key={i} className="bg-muted/30 p-4 rounded-lg border border-gray-800">
                                        <div className="flex justify-between items-start">
                                            <span className="text-gray-300">{a.question}</span>
                                            <span className={`ml-4 px-3 py-1 rounded text-xs font-medium ${a.answer === 'yes'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                {a.answer.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={handleGenerateReport}
                                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-4 rounded-lg transition-colors"
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>
                )}

                {/* Report Step */}
                {currentStep === 'report' && (
                    <div className="space-y-6">
                        <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-3xl font-light mb-2">RCM Analysis Report</h2>
                                    <p className="text-gray-500 text-sm">
                                        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                                    </p>
                                </div>
                                <button
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>

                            <div className="space-y-6 mb-8">
                                <div className="bg-muted/30 p-6 rounded-lg border border-gray-800">
                                    <h3 className="text-sm text-gray-500 mb-1">Ship</h3>
                                    <p className="text-xl text-white">{getShipLabel(selectedShip)}</p>
                                </div>
                                <div className="bg-muted/30 p-6 rounded-lg border border-gray-800">
                                    <h3 className="text-sm text-gray-500 mb-1">Equipment</h3>
                                    <p className="text-xl text-white">{getEquipmentLabel(selectedShip, selectedEquipment)}</p>
                                </div>
                            </div>

                            <div className="bg-cyan-500/10 border border-cyan-500/30 p-6 rounded-lg mb-8">
                                <h3 className="text-sm text-cyan-400 mb-2">RECOMMENDATION</h3>
                                <p className="text-2xl font-light text-white">{getEndpointResult()}</p>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-light mb-4 text-gray-400">Decision Path</h3>
                                <div className="bg-muted/30 p-6 rounded-lg border border-gray-800 overflow-x-auto">
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        {getPathBreadcrumb()}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-light mb-4 text-gray-400">Complete Answer Log</h3>
                                <div className="space-y-2">
                                    {answers.map((a, i) => (
                                        <div key={i} className="bg-muted/30 p-4 rounded-lg border border-gray-800 flex justify-between items-center">
                                            <span className="text-gray-300">{a.question}</span>
                                            <span className={`px-3 py-1 rounded text-xs font-medium ${a.answer === 'yes'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-rose-500/20 text-rose-400'
                                                }`}>
                                                {a.answer.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleStartNew}
                                className="w-full mt-8 bg-gray-800 hover:bg-gray-700 text-white font-medium py-4 rounded-lg transition-colors"
                            >
                                Start New Analysis
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}