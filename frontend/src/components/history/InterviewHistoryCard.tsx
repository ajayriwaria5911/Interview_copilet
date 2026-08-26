// frontend/src/components/history/InterviewHistoryCard.tsx

import {
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ChevronRight,
  Calendar,
  MessageSquare,
} from "lucide-react";
import type { InterviewDto } from "../../types/interview.types";

interface Props {
  interview: InterviewDto;
  onClick: () => void;
}

export default function InterviewHistoryCard({ interview, onClick }: Props) {
  const statusConfig = {
    COMPLETED: {
      icon: <CheckCircle className="w-4 h-4 text-green-400" />,
      color: "text-green-400 bg-green-400/10 border-green-400/20",
      label: "Completed",
    },
    IN_PROGRESS: {
      icon: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
      color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      label: "In Progress",
    },
    SCHEDULED: {
      icon: <Clock className="w-4 h-4 text-yellow-400" />,
      color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      label: "Scheduled",
    },
    CANCELLED: {
      icon: <XCircle className="w-4 h-4 text-red-400" />,
      color: "text-red-400 bg-red-400/10 border-red-400/20",
      label: "Cancelled",
    },
  };

  const typeColor = {
    TECHNICAL: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    BEHAVIORAL: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    CODING: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  const status =
    statusConfig[interview.status as keyof typeof statusConfig] ??
    statusConfig.SCHEDULED;

  const typeStyle =
    typeColor[interview.type as keyof typeof typeColor] ??
    typeColor.TECHNICAL;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-700/50 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">

          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeStyle}`}>
              {interview.type}
            </span>
            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>

          {/* Topic and role */}
          <p className="text-white font-semibold text-sm truncate">
            {interview.topic}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            {interview.jobRole} · {interview.experienceLevel}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(interview.createdAt)}
            </div>

            {interview.durationMinutes && (
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <Clock className="w-3.5 h-3.5" />
                {interview.durationMinutes}m
              </div>
            )}

            {interview.totalQuestions && (
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
                {interview.answeredQuestions ?? 0}/{interview.totalQuestions} Q
              </div>
            )}
          </div>
        </div>

        {/* Score + arrow */}
        <div className="flex items-center gap-3 shrink-0">
          {interview.overallScore !== null && (
            <div className="text-right">
              <p className={`text-2xl font-bold ${getScoreColor(interview.overallScore ?? 0)}`}>
                {Math.round(interview.overallScore ?? 0)}%
              </p>
              <p className="text-slate-500 text-xs">Score</p>
            </div>
          )}

          {interview.overallScore === null &&
            interview.status === "COMPLETED" && (
              <div className="text-right">
                <p className="text-slate-500 text-sm">No score</p>
              </div>
            )}

          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
        </div>
      </div>

      {/* Progress bar for answered questions */}
      {interview.status === "COMPLETED" && interview.totalQuestions && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Questions answered</span>
            <span>
              {interview.answeredQuestions ?? 0}/{interview.totalQuestions}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
              style={{
                width: `${((interview.answeredQuestions ?? 0) / interview.totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}