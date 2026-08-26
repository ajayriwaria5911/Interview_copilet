// frontend/src/pages/InterviewDetailPage.tsx

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInterviewStore } from "../store/interviewStore";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MessageSquare,
  Target,
  BrainCircuit,
  Loader2,
  Award,
} from "lucide-react";

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedHistory, isLoading, fetchHistory } = useInterviewStore();

  useEffect(() => {
    if (id) fetchHistory(Number(id));
  }, [id, fetchHistory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!selectedHistory) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  const questionMessages = selectedHistory.questions ?? [];
  const feedbackMessages = selectedHistory.feedbacks ?? [];
  const score = selectedHistory.overallScore ?? 0;

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/history")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-white font-semibold">
                {selectedHistory.topic}
              </h1>
              <p className="text-slate-400 text-xs">
                {selectedHistory.jobRole}
              </p>
            </div>
          </div>

          {score > 0 && (
            <div className="flex items-center gap-2">
              <Award className={`w-5 h-5 ${getScoreColor(score)}`} />
              <span className={`text-xl font-bold ${getScoreColor(score)}`}>
                {Math.round(score)}%
              </span>
              <span className={`text-sm ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Status",
              value: selectedHistory.status,
              icon: CheckCircle,
              color: "text-green-400",
            },
            {
              label: "Questions",
              value: `${selectedHistory.answeredQuestions ?? 0}/${selectedHistory.totalQuestions ?? 0}`,
              icon: MessageSquare,
              color: "text-blue-400",
            },
            {
              label: "Duration",
              value: selectedHistory.durationMinutes
                ? `${selectedHistory.durationMinutes}m`
                : "N/A",
              icon: Clock,
              color: "text-purple-400",
            },
            {
              label: "Score",
              value: score > 0 ? `${Math.round(score)}%` : "N/A",
              icon: Target,
              color: getScoreColor(score),
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4"
            >
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Questions & Feedback */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            Interview Q&A Review
          </h2>

          {questionMessages.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">
              No questions recorded for this interview.
            </p>
          ) : (
            <div className="space-y-6">
              {questionMessages.map((q, index) => {
                const feedback = feedbackMessages[index];
                return (
                  <div
                    key={q.id}
                    className="border border-slate-700 rounded-xl p-4 space-y-3"
                  >
                    {/* Question */}
                    <div className="flex items-start gap-3">
                      <span className="bg-indigo-500/20 text-indigo-400 text-xs font-bold px-2 py-1 rounded-lg shrink-0">
                        Q{index + 1}
                      </span>
                      <p className="text-white text-sm leading-relaxed">
                        {q.questionText}
                      </p>
                    </div>

                    {/* Difficulty badge */}
                    <div className="flex items-center gap-2 ml-10">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${
                          q.difficulty === "HARD"
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : q.difficulty === "MEDIUM"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                      <span className="text-slate-500 text-xs">{q.type}</span>
                    </div>

                    {/* User answer */}
                    {q.userAnswer && (
                      <div className="ml-10 bg-slate-900/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-medium mb-1">
                          Your Answer:
                        </p>
                        <p className="text-slate-300 text-sm">
                          {q.userAnswer}
                        </p>
                      </div>
                    )}

                    {/* Feedback */}
                    {feedback && (
                      <div className="ml-10 bg-yellow-500/5 border border-yellow-500/10 rounded-lg p-3">
                        <p className="text-yellow-400 text-xs font-medium mb-1">
                          💡 AI Feedback:
                        </p>
                        <p className="text-slate-300 text-sm">
                          {feedback.feedbackText}
                        </p>
                        {feedback.score && (
                          <p
                            className={`text-xs font-bold mt-2 ${getScoreColor(feedback.score)}`}
                          >
                            Score: {Math.round(feedback.score)}%
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}