// frontend/src/components/resume/AtsScoreSection.tsx

import type { Resume } from "../../types/resume.types";

interface Props {
  resume: Resume;
}

export default function AtsScoreSection({ resume }: Props) {
  const score = resume.atsScore ?? 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6">ATS Score Analysis</h3>

      {/* Score Circle */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="#334155"
              strokeWidth="10"
            />
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444"}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${getScoreColor(score)}`}>
              {resume.atsScore !== null ? `${score}%` : "N/A"}
            </span>
          </div>
        </div>

        <div>
          <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </p>
          <p className="text-slate-400 text-sm mt-1">ATS Compatibility Score</p>
          <p className="text-slate-500 text-xs mt-1">
            {resume.wordCount} words · {resume.skills?.length ?? 0} skills detected
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Score</span>
          <span>{score}/100</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${getScoreBg(score)}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-300 mb-3">
            Detected Skills ({resume.skills.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {resume.atsScore === null && (
        <div className="mt-4 p-3 bg-slate-700/50 rounded-xl text-slate-400 text-sm text-center">
          ATS Score analysis coming soon with AI Service (Day 8)
        </div>
      )}
    </div>
  );
}