// frontend/src/store/chatStore.ts

import { create } from "zustand";
import { chatApi } from "../api/chatApi";
import type { ChatStoreState, SendMessageRequest } from "../types/chat.types";
import { type AxiosError } from "axios";

export const useChatStore = create<ChatStoreState>()((set, get) => ({
  messages: [],
  isLoading: false,
  isSending: false,
  isTyping: false,
  error: null,
  currentQuestionIndex: 0,
  conversation: null,

  fetchMessages: async (interviewId: number) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await chatApi.getMessages(interviewId);
      set({ messages, isLoading: false });
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({
        isLoading: false,
        error: error.response?.data?.message ?? "Failed to fetch messages",
      });
    }
  },

  fetchNextQuestion: async (interviewId: number) => {
    set({ isTyping: true, error: null });
    try {
      const question = await chatApi.getNextQuestion(interviewId);
      set((state) => ({
        messages: [...state.messages, question],
        currentQuestionIndex: state.currentQuestionIndex + 1,
        isTyping: false,
      }));
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      set({
        isTyping: false,
        error: error.response?.data?.message ?? "Failed to get question",
      });
    }
  },

  sendMessage: async (request: SendMessageRequest) => {
    set({ isSending: true, error: null });

    // Optimistically add user message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      interviewId: request.interviewId,
      userId: 0,
      role: "user" as const,
      content: request.content,
      messageType: request.messageType,
      questionIndex: request.questionIndex,
      score: null,
      isQuestion: false,
      topic: null,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempMessage],
    }));

    try {
      const response = await chatApi.sendMessage(request);

      // Replace temp message and add AI response
      set((state) => ({
        messages: [
          ...state.messages.filter((m) => m.id !== tempMessage.id),
          { ...tempMessage, id: `user-${Date.now()}` },
          response,
        ],
        isSending: false,
      }));
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      // Remove temp message on error
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== tempMessage.id),
        isSending: false,
        error: error.response?.data?.message ?? "Failed to send message",
      }));
    }
  },

  clearChat: () =>
    set({
      messages: [],
      conversation: null,
      currentQuestionIndex: 0,
      error: null,
    }),

  setTyping: (typing: boolean) => set({ isTyping: typing }),
}));