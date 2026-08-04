// frontend/src/components/resume/ResumeUpload.tsx

import { useCallback, useState } from "react";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { useResumeStore } from "../../store/resumeStore";

export default function ResumeUpload() {
  const { uploadResume, isUploading, error, clearError } = useResumeStore();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".pdf")) {
        alert("Only PDF files are allowed");
        return;
      }
      setSelectedFile(file);
      await uploadResume(file);
      setSelectedFile(null);
    },
    [uploadResume]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-indigo-400" />
        Upload Resume
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
          <span>⚠️ {error}</span>
          <button onClick={clearError}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
          ${dragOver
            ? "border-indigo-500 bg-indigo-500/10"
            : "border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50"
          }`}
        onClick={() => document.getElementById("resume-input")?.click()}
      >
        <input
          id="resume-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
            <p className="text-slate-300 text-sm">
              Uploading {selectedFile?.name}...
            </p>
            <p className="text-slate-500 text-xs">Parsing skills and extracting text</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-indigo-500/20 p-4 rounded-full">
              <FileText className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-medium">
                Drop your resume here or click to browse
              </p>
              <p className="text-slate-400 text-sm mt-1">
                PDF only — Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}