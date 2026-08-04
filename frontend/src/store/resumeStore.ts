// frontend/src/store/resumeStore.ts

import { create } from "zustand";
import { resumeApi } from "../api/resumeApi";
import type { ResumeState } from "../types/resume.types";
import { type AxiosError } from "axios";

export const useResumeStore = create<ResumeState>()((set, get) => ({
  resumes: [],
  selectedResume: null,
  isLoading: false,
  isUploading: false,
  error: null,

  fetchResumes: async () => {
    set({ isLoading: true, error: null });
    try {
      const resumes = await resumeApi.getAll();
      set({ resumes, isLoading: false });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: error.response?.data?.message ?? "Failed to fetch resumes",
      });
    }
  },

  uploadResume: async (file: File) => {
    set({ isUploading: true, error: null });
    try {
      await resumeApi.upload(file);
      await get().fetchResumes();
      set({ isUploading: false });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({
        isUploading: false,
        error: error.response?.data?.message ?? "Failed to upload resume",
      });
    }
  },

  deleteResume: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await resumeApi.delete(id);
      set((state) => ({
        resumes: state.resumes.filter((r) => r.id !== id),
        selectedResume:
          state.selectedResume?.id === id ? null : state.selectedResume,
        isLoading: false,
      }));
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: error.response?.data?.message ?? "Failed to delete resume",
      });
    }
  },

  selectResume: (resume) => set({ selectedResume: resume }),
  clearError: () => set({ error: null }),
}));