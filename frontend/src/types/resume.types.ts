// frontend/src/types/resume.types.ts

export interface Resume {
  id: number;
  fileName: string;
  status: "UPLOADED" | "PROCESSING" | "ANALYZED" | "FAILED";
  atsScore: number | null;
  uploadedAt: string;
  skills: string[];
  wordCount: number;
}

export interface ResumeUploadResponse {
  resumeId: number;
  fileName: string;
  status: string;
  message: string;
}

export interface ResumeState {
  resumes: Resume[];
  selectedResume: Resume | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  fetchResumes: () => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  deleteResume: (id: number) => Promise<void>;
  selectResume: (resume: Resume | null) => void;
  clearError: () => void;
}