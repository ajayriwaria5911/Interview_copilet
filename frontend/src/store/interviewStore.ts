// frontend/src/store/interviewStore.ts

import { create } from "zustand";
import { interviewApi } from "../api/interviewApi";
import type {
  InterviewDto,
  InterviewHistoryDto,
  CreateInterviewRequest,
} from "../types/interview.types";
import { type AxiosError } from "axios";

interface InterviewStoreState {
  interviews: InterviewDto[];
  selectedInterview: InterviewDto | null;
  selectedHistory: InterviewHistoryDto | null;
  isLoading: boolean;
  error: string | null;
  fetchInterviews: () => Promise<void>;
  fetchHistory: (id: number) => Promise<void>;
  createInterview: (req: CreateInterviewRequest) => Promise<InterviewDto>;
  selectInterview: (interview: InterviewDto | null) => void;
  clearError: () => void;
}

export const useInterviewStore = create<InterviewStoreState>()((set) => ({
  interviews: [],
  selectedInterview: null,
  selectedHistory: null,
  isLoading: false,
  error: null,

  fetchInterviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const interviews = await interviewApi.getAll();
      set({ interviews, isLoading: false });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: error.response?.data?.message ?? "Failed to fetch interviews",
      });
    }
  },

  fetchHistory: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const history = await interviewApi.getHistory(id);
      set({ selectedHistory: history, isLoading: false });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: error.response?.data?.message ?? "Failed to fetch history",
      });
    }
  },

  createInterview: async (req: CreateInterviewRequest) => {
    set({ isLoading: true, error: null });
    try {
      const interview = await interviewApi.create(req);
      set((state) => ({
        interviews: [interview, ...state.interviews],
        isLoading: false,
      }));
      return interview;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: error.response?.data?.message ?? "Failed to create interview",
      });
      throw err;
    }
  },

  selectInterview: (interview) =>
    set({ selectedInterview: interview }),

  clearError: () => set({ error: null }),
}));