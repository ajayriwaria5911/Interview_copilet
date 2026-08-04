// frontend/src/api/resumeApi.ts

import { apiClient } from "./axios";
import type { Resume, ResumeUploadResponse } from "../types/resume.types";

export const resumeApi = {
  getAll: async (): Promise<Resume[]> => {
    const { data } = await apiClient.get<Resume[]>("/api/resumes");
    return data;
  },

  upload: async (file: File): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await apiClient.post<ResumeUploadResponse>(
      "/api/resumes/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  getById: async (id: number): Promise<Resume> => {
    const { data } = await apiClient.get<Resume>(`/api/resumes/${id}`);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/resumes/${id}`);
  },
};