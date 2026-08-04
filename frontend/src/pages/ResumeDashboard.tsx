// frontend/src/pages/ResumeDashboard.tsx

import { useAuthStore } from "../store/authStore";
import { useResumeStore } from "../store/resumeStore";
import ResumeUpload from "../components/resume/ResumeUpload";
import ResumeList from "../components/resume/ResumeList";
import AtsScoreSection from "../components/resume/AtsScoreSection";
import { BrainCircuit, LogOut, User } from "lucide-react";

export default function ResumeDashboard() {
  const { user, logout } = useAuthStore();
  const { selectedResume } = useResumeStore();

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              InterviewCopilot AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <div className="bg-slate-700 p-1.5 rounded-full">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm hidden sm:block">
                {user?.fullName}
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Resume Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Upload and manage your resumes — get ATS scores and skill analysis
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <ResumeUpload />
            <ResumeList />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            {selectedResume ? (
              <AtsScoreSection resume={selectedResume} />
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-64">
                <div className="bg-slate-700/50 p-5 rounded-full mb-4">
                  <BrainCircuit className="w-10 h-10 text-slate-500" />
                </div>
                <p className="text-slate-300 font-medium text-lg">
                  Select a resume to view analysis
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Click on any resume from the list to see its ATS score and skill breakdown
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}