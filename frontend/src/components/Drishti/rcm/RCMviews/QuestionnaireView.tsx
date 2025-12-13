import { ChevronLeft } from 'lucide-react';

interface QuestionnaireViewProps {
    currentQuestion: {
        question: string;
    };
    progress: number;
    canGoBack: boolean;
    onAnswer: (answer: string) => void;
    onBack: () => void;
}

export default function QuestionnaireView({
    currentQuestion,
    progress,
    canGoBack,
    onAnswer,
    onBack
}: QuestionnaireViewProps) {
    return (
        <div>
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-cyan-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-cyan-500 transition-all" 
                        style={{ width: `${progress}%` }} 
                    />
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-black rounded-xl p-12 border border-gray-800 mb-6">
                <div className="text-center space-y-8">
                    <h2 className="text-2xl font-light text-gray-300">
                        {currentQuestion.question}
                    </h2>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => onAnswer("yes")}
                            className="px-12 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
                        >
                            YES
                        </button>

                        <button
                            onClick={() => onAnswer("no")}
                            className="px-12 py-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-lg transition-colors"
                        >
                            NO
                        </button>
                    </div>
                </div>
            </div>

            {/* Back Button */}
            {canGoBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" /> Back
                </button>
            )}
        </div>
    );
}