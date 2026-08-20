// frontend/src/components/interview/QuestionCard.tsx

import { HelpCircle, ChevronRight } from "lucide-react";

interface Props {
  questionNumber: number;
  totalQuestions: number;
  topic: string;
  onGetQuestion: () => void;
  isLoading: boolean;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  topic,
  onGetQuestion,
  isLoading,
}: Props) {
  return (
    <div className="bg-slate-800 border border-indigo-500/20 rounded-2xl p-6 mb-6 mx-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-xl">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">
              Ready for Question {questionNumber}?
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Topic: {topic} · {questionNumber}/{totalQuestions}
            </p>
          </div>
        </div>
        <button
          onClick={onGetQuestion}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Get Question
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}