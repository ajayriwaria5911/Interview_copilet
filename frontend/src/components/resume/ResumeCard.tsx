// frontend/src/components/resume/ResumeCard.tsx

import { FileText, Trash2, Eye, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import type { Resume } from "../../types/resume.types";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";

interface Props {
  resume: Resume;
}

export default function ResumeCard({ resume }: Props) {
  const { deleteResume, selectResume, selectedResume } = useResumeStore();
  const { accessToken } = useAuthStore();
  const isSelected = selectedResume?.id === resume.id;

  const statusIcon = {
    UPLOADED: <Clock className="w-4 h-4 text-yellow-400" />,
    PROCESSING: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
    ANALYZED: <CheckCircle className="w-4 h-4 text-green-400" />,
    FAILED: <XCircle className="w-4 h-4 text-red-400" />,
  };

  const statusColor = {
    UPLOADED: "text-yellow-400 bg-yellow-400/10",
    PROCESSING: "text-blue-400 bg-blue-400/10",
    ANALYZED: "text-green-400 bg-green-400/10",
    FAILED: "text-red-400 bg-red-400/10",
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(
        `http://localhost:8082/api/resumes/${resume.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch resume");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      alert("Could not open resume. Please try again.");
    }
  };

  return (
    <div
      className={`bg-slate-800 border rounded-xl p-4 transition-all cursor-pointer
        ${isSelected
          ? "border-indigo-500 bg-indigo-500/5"
          : "border-slate-700 hover:border-slate-600"
        }`}
      onClick={() => selectResume(isSelected ? null : resume)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-indigo-500/20 p-2 rounded-lg shrink-0">
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">
              {resume.fileName}
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              {formatDate(resume.uploadedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor[resume.status]}`}>
            {statusIcon[resume.status]}
            {resume.status}
          </span>
        </div>
      </div>

      {resume.skills && resume.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {resume.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-xs"
            >
              {skill}
            </span>
          ))}
          {resume.skills.length > 4 && (
            <span className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-xs">
              +{resume.skills.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
        <span className="text-slate-500 text-xs">
          {resume.wordCount} words
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleView}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this resume?")) {
                deleteResume(resume.id);
              }
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}