// frontend/src/pages/HistoryPage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterviewStore } from "../store/interviewStore";
import { useAuthStore } from "../store/authStore";
import InterviewHistoryCard from "../components/history/InterviewHistoryCard";
import ProgressStats from "../components/history/ProgressStats";
import PerformanceChart from "../components/history/PerformanceChart";
import type { InterviewDto } from "../types/interview.types";
import {
  BrainCircuit,
  LogOut,
  User,
  ArrowLeft,
  Plus,
  Loader2,
  Filter,
  Search,
} from "lucide-react";

const FILTER_TYPES = ["ALL", "TECHNICAL", "BEHAVIORAL", "CODING"];
const FILTER_STATUS = ["ALL", "COMPLETED", "SCHEDULED", "CANCELLED"];

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { interviews, isLoading, error, fetchInterviews } =
    useInterviewStore();

  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const filtered = interviews
    .filter((i) => typeFilter === "ALL" || i.type === typeFilter)
    .filter((i) => statusFilter === "ALL" || i.status === statusFilter)
    .filter(
      (i) =>
        searchQuery === "" ||
        i.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.jobRole?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "score") {
        return (b.overallScore ?? 0) - (a.overallScore ?? 0);
      }
      return (
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

  const handleCardClick = (interview: InterviewDto) => {
    if (interview.status === "IN_PROGRESS") {
      navigate(`/interview/${interview.id}`);
    } else {
      navigate(`/history/${interview.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-lg">
                  Interview History
                </span>
                <p className="text-slate-400 text-xs">
                  Track your progress and performance
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/interview/new")}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:block">New Interview</span>
            </button>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="bg-slate-700 p-1.5 rounded-full">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm hidden sm:block">{user?.fullName}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Progress Stats */}
        <ProgressStats interviews={interviews} />

        {/* Performance Chart */}
        <PerformanceChart interviews={interviews} />

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-2 flex-wrap">

            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by topic or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-600 rounded-lg p-1">
              {FILTER_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    typeFilter === type
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-600 rounded-lg p-1">
              {FILTER_STATUS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    statusFilter === status
                      ? "bg-purple-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "score")
                }
                className="bg-slate-900 border border-slate-600 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interview list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">
              Interviews
              <span className="ml-2 text-slate-400 font-normal text-sm">
                ({filtered.length})
              </span>
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-400 text-sm">⚠️ {error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 max-w-md mx-auto">
                <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 font-medium text-lg">
                  No interviews found
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {interviews.length === 0
                    ? "Start your first interview to see your history here."
                    : "Try adjusting the filters to see more results."}
                </p>
                <button
                  onClick={() => navigate("/interview/new")}
                  className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Start Interview
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((interview) => (
                <InterviewHistoryCard
                  key={interview.id}
                  interview={interview}
                  onClick={() => handleCardClick(interview)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}