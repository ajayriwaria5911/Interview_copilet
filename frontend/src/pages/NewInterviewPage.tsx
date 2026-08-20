// frontend/src/pages/NewInterviewPage.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, ArrowLeft, Loader2 } from "lucide-react";
import { apiClient } from "../api/axios";
import type { InterviewDto } from "../types/interview.types";

const INTERVIEW_TYPES = ["TECHNICAL", "BEHAVIORAL", "CODING"];
const EXPERIENCE_LEVELS = ["Entry-Level", "Mid-Level", "Senior"];
const TOPICS = [
  "Java Spring Boot",
  "Python Django",
  "React Frontend",
  "Node.js Backend",
  "System Design",
  "Data Structures",
  "DevOps",
  "Machine Learning",
  "Database Design",
  "Microservices",
];

// ── Valid job roles ───────────────────────────────────────────────
const VALID_JOB_ROLES = [
  "backend developer",
  "frontend developer",
  "full stack developer",
  "software engineer",
  "java developer",
  "python developer",
  "react developer",
  "node.js developer",
  "devops engineer",
  "data scientist",
  "machine learning engineer",
  "mobile developer",
  "android developer",
  "ios developer",
  "cloud engineer",
  "database administrator",
  "system architect",
  "qa engineer",
  "security engineer",
  "ui/ux developer",
];

const JOB_KEYWORDS = [
  "developer", "engineer", "designer", "analyst", "architect",
  "manager", "lead", "scientist", "administrator", "specialist",
  "consultant", "intern", "junior", "senior", "principal",
  "java", "python", "react", "node", "angular", "vue",
  "devops", "cloud", "data", "ml", "ai", "mobile", "ios",
  "android", "backend", "frontend", "fullstack", "full stack",
  "security", "qa", "testing", "database", "system",
];

// ── Job role validator ────────────────────────────────────────────
const validateJobRole = (role: string): boolean => {
  if (!role || role.trim().length < 3) return false;

  const cleaned = role.trim().toLowerCase();

  if (cleaned.length < 3) return false;

  // Must contain only valid characters
  const words = cleaned.split(/\s+/);
  const hasValidWords = words.every((word) =>
    /^[a-zA-Z./+#-]+$/.test(word)
  );
  if (!hasValidWords) return false;

  // Must not be random characters
  const uniqueChars = new Set(cleaned.replace(/\s/g, "")).size;
  if (uniqueChars < 3 && cleaned.length > 4) return false;

  // Check for repeated characters pattern (like "hdhdhd")
  const isRepetitive = /(.{2,})\1{2,}/.test(cleaned);
  if (isRepetitive) return false;

  // Must match job keywords or known roles
  const matchesKeyword = JOB_KEYWORDS.some((kw) => cleaned.includes(kw));
  const matchesKnownRole = VALID_JOB_ROLES.some(
    (r) => cleaned.includes(r) || r.includes(cleaned)
  );

  return matchesKeyword || matchesKnownRole;
};

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    type: "TECHNICAL",
    topic: "Java Spring Boot",
    jobRole: "",
    experienceLevel: "Mid-Level",
    totalQuestions: 10,
  });

  const handleSubmit = async () => {
    // Validate job role
    if (!form.jobRole.trim()) {
      setError("Please enter a job role.");
      return;
    }

    if (!validateJobRole(form.jobRole)) {
      setError(
        `"${form.jobRole}" is not a valid job role. Please enter a proper job title like "Backend Developer", "React Developer", "Data Scientist", etc.`
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: interview } = await apiClient.post<InterviewDto>(
        "/api/interviews",
        form
      );
      await apiClient.post(`/api/interviews/${interview.id}/start`);
      navigate(`/interview/${interview.id}`);
    } catch {
      setError("Failed to create interview. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500 rounded-full opacity-5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full opacity-5 blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">New Interview</h1>
              <p className="text-slate-400 text-sm">Set up your practice session</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 space-y-6">

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Interview Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setForm({ ...form, type })}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.type === type
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Topic
            </label>
            <select
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Job Role — with validation */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Job Role
            </label>
            <input
              type="text"
              value={form.jobRole}
              onChange={(e) => {
                setForm({ ...form, jobRole: e.target.value });
                setError(null); // clear error on change
              }}
              placeholder="e.g. Backend Developer, React Developer, Data Scientist"
              className={`w-full bg-slate-900 border text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                error && error.includes("valid job role")
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-600 focus:ring-indigo-500"
              }`}
            />
            <p className="text-slate-500 text-xs mt-1.5">
              Examples: Backend Developer · Frontend Developer ·
              Full Stack Engineer · DevOps Engineer · Data Scientist · ML Engineer
            </p>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setForm({ ...form, experienceLevel: level })}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.experienceLevel === level
                      ? "bg-purple-600 border-purple-500 text-white"
                      : "bg-slate-900 border-slate-600 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Number of Questions: {form.totalQuestions}
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={form.totalQuestions}
              onChange={(e) =>
                setForm({ ...form, totalQuestions: Number(e.target.value) })
              }
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>5 (Quick)</span>
              <span>10 (Standard)</span>
              <span>20 (Full)</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Starting Interview...
              </>
            ) : (
              "Start Interview →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}