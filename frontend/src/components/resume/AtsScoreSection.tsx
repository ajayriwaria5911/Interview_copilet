// frontend/src/components/resume/AtsScoreSection.tsx

import { useState } from "react";
import { Loader2, Zap, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { apiClient } from "../../api/axios";
import type { Resume } from "../../types/resume.types";
import { useResumeStore } from "../../store/resumeStore";

interface AtsResult {
  resumeId: number;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  summary: string;
  experienceLevel: string;
}

interface Props {
  resume: Resume;
}

export default function AtsScoreSection({ resume }: Props) {
  const { fetchResumes } = useResumeStore();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const score = atsResult?.score ?? resume.atsScore ?? 0;

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-400";
    if (s >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Needs Work";
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const { data } = await apiClient.post<AtsResult>(
        `/api/ats/analyze/${resume.id}`
      );
      setAtsResult(data);
      await fetchResumes();
    } catch {
      setError("Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          ATS Score Analysis
        </h3>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analyze Now
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Score Circle */}
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
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
            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score > 0 ? `${Math.round(score)}%` : "N/A"}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            ATS Compatibility Score
          </p>
          {atsResult && (
            <p className="text-slate-500 text-xs mt-1">
              {atsResult.experienceLevel} Level
            </p>
          )}

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${getScoreBg(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {atsResult?.summary && (
        <div className="p-4 bg-slate-700/50 rounded-xl">
          <p className="text-slate-300 text-sm">{atsResult.summary}</p>
        </div>
      )}

      {/* Matched Keywords */}
      {atsResult?.matchedKeywords && atsResult.matchedKeywords.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Matched Keywords ({atsResult.matchedKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {atsResult.matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 rounded-full text-xs font-medium"
              >
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>
      )}
w
      {/* Missing Keywords */}
      {atsResult?.missingKeywords && atsResult.missingKeywords.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Missing Keywords ({atsResult.missingKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {atsResult.missingKeywords.map((kw) => (
              <span
                key={kw}
                className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-medium"
              >
                ✗ {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Detected Skills */}
      {resume.skills && resume.skills.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-indigo-400 mb-3">
            Detected Skills ({resume.skills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {atsResult?.suggestions && atsResult.suggestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Suggestions to Improve
          </h4>
          <ul className="space-y-2">
            {atsResult.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-slate-300"
              >
                <span className="text-yellow-400 mt-0.5 shrink-0">→</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Placeholder when not analyzed */}
      {!atsResult && resume.atsScore === null && (
        <div className="p-4 bg-slate-700/30 rounded-xl text-center">
          <Zap className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">
            Click <strong className="text-white">Analyze Now</strong> to get
            your ATS score, keyword analysis, and improvement suggestions
          </p>
        </div>
      )}
    </div>
  );
}