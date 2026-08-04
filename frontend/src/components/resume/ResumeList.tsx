// frontend/src/components/resume/ResumeList.tsx

import { useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useResumeStore } from "../../store/resumeStore";
import ResumeCard from "./ResumeCard";

export default function ResumeList() {
  const { resumes, isLoading, fetchResumes } = useResumeStore();

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">My Resumes</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          My Resumes
          <span className="ml-2 text-sm text-slate-400 font-normal">
            ({resumes.length})
          </span>
        </h2>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-slate-700/50 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium">No resumes uploaded yet</p>
          <p className="text-slate-500 text-sm mt-1">
            Upload your first resume to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </div>
  );
}