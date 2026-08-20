// frontend/src/api/chatApi.ts

import { apiClient } from "./axios";
import type {
  ChatMessage,
  ConversationDto,
  SendMessageRequest,
} from "../types/chat.types";

export const chatApi = {
  getNextQuestion: async (interviewId: number): Promise<ChatMessage> => {
    const { data } = await apiClient.get<ChatMessage>(
      `/api/chat/${interviewId}/next-question`
    );
    return data;
  },

  sendMessage: async (
    request: SendMessageRequest
  ): Promise<ChatMessage> => {
    const { data } = await apiClient.post<ChatMessage>(
      "/api/chat/send",
      request
    );
    return data;
  },

  getMessages: async (interviewId: number): Promise<ChatMessage[]> => {
    const { data } = await apiClient.get<ChatMessage[]>(
      `/api/chat/${interviewId}/messages`
    );
    return data;
  },

  getConversation: async (
    interviewId: number
  ): Promise<ConversationDto> => {
    const { data } = await apiClient.get<ConversationDto>(
      `/api/chat/${interviewId}/conversation`
    );
    return data;
  },

  clearConversation: async (interviewId: number): Promise<void> => {
    await apiClient.delete(`/api/chat/${interviewId}/clear`);
  },
};