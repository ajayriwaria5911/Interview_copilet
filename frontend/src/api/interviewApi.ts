// frontend/src/api/interviewApi.ts

import { apiClient } from "./axios";
import type {
  InterviewDto,
  InterviewHistoryDto,
  CreateInterviewRequest,
} from "../types/interview.types";

export const interviewApi = {
  getAll: async (): Promise<InterviewDto[]> => {
    const { data } = await apiClient.get<InterviewDto[]>("/api/interviews");
    return data;
  },

  getById: async (id: number): Promise<InterviewDto> => {
    const { data } = await apiClient.get<InterviewDto>(
      `/api/interviews/${id}`
    );
    return data;
  },

  getHistory: async (id: number): Promise<InterviewHistoryDto> => {
    const { data } = await apiClient.get<InterviewHistoryDto>(
      `/api/interviews/${id}/history`
    );
    return data;
  },

  getAllHistory: async (): Promise<InterviewDto[]> => {
    const { data } = await apiClient.get<InterviewDto[]>(
      "/api/interviews/history"
    );
    return data;
  },

  create: async (
    request: CreateInterviewRequest
  ): Promise<InterviewDto> => {
    const { data } = await apiClient.post<InterviewDto>(
      "/api/interviews",
      request
    );
    return data;
  },

  start: async (id: number): Promise<InterviewDto> => {
    const { data } = await apiClient.post<InterviewDto>(
      `/api/interviews/${id}/start`
    );
    return data;
  },

  complete: async (id: number): Promise<InterviewDto> => {
    const { data } = await apiClient.post<InterviewDto>(
      `/api/interviews/${id}/complete`
    );
    return data;
  },

  cancel: async (id: number): Promise<InterviewDto> => {
    const { data } = await apiClient.post<InterviewDto>(
      `/api/interviews/${id}/cancel`
    );
    return data;
  },

  getByType: async (type: string): Promise<InterviewDto[]> => {
    const { data } = await apiClient.get<InterviewDto[]>(
      `/api/interviews/type/${type}`
    );
    return data;
  },
};