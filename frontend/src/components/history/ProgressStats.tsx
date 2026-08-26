// frontend/src/components/history/ProgressStats.tsx

import {
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  Award,
  Zap,
} from "lucide-react";
import type { InterviewDto } from "../../types/interview.types";

interface Props {
  interviews: InterviewDto[];
}

export default function ProgressStats({ interviews }: Props) {
  const completed = interviews.filter((i) => i.status === "COMPLETED");
  const totalInterviews = interviews.length;
  const completedCount = completed.length;

  const avgScore =
    completed.filter((i) => i.overallScore !== null).length > 0
      ? completed
          .filter((i) => i.overallScore !== null)
          .reduce((sum, i) => sum + (i.overallScore ?? 0), 0) /
        completed.filter((i) => i.overallScore !== null).length
      : 0;

  const avgDuration =
    completed.filter((i) => i.durationMinutes !== null).length > 0
      ? completed
          .filter((i) => i.durationMinutes !== null)
          .reduce((sum, i) => sum + (i.durationMinutes ?? 0), 0) /
        completed.filter((i) => i.durationMinutes !== null).length
      : 0;

  const technicalCount = interviews.filter(
    (i) => i.type === "TECHNICAL"
  ).length;

  const behavioralCount = interviews.filter(
    (i) => i.type === "BEHAVIORAL"
  ).length;

  const codingCount = interviews.filter(
    (i) => i.type === "CODING"
  ).length;

  const bestScore = completed.length > 0
    ? Math.max(...completed.map((i) => i.overallScore ?? 0))
    : 0;

  const stats = [
    {
      label: "Total Interviews",
      value: totalInterviews.toString(),
      icon: Target,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      label: "Completed",
      value: completedCount.toString(),
      icon: CheckCircle,
      color: "text-green-400",
      bg: "bg-green-500/10 border-green-500/20",
    },
    {
      label: "Avg Score",
      value: avgScore > 0 ? `${Math.round(avgScore)}%` : "N/A",
      icon: TrendingUp,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Best Score",
      value: bestScore > 0 ? `${Math.round(bestScore)}%` : "N/A",
      icon: Award,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    {
      label: "Avg Duration",
      value: avgDuration > 0 ? `${Math.round(avgDuration)}m` : "N/A",
      icon: Clock,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      label: "Technical",
      value: technicalCount.toString(),
      icon: Zap,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className={`bg-slate-800 border rounded-xl p-4 flex flex-col gap-2 ${bg}`}
          >
            <div className={`${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Interview type breakdown */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <p className="text-slate-300 text-sm font-semibold mb-3">
          Interview Type Breakdown
        </p>
        <div className="space-y-2">
          {[
            { label: "Technical", count: technicalCount, color: "bg-blue-500" },
            { label: "Behavioral", count: behavioralCount, color: "bg-purple-500" },
            { label: "Coding", count: codingCount, color: "bg-green-500" },
          ].map(({ label, count, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{label}</span>
                <span>{count} interviews</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${color} transition-all duration-500`}
                  style={{
                    width: totalInterviews > 0
                      ? `${(count / totalInterviews) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}