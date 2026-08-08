// frontend/src/store/sessionStore.ts

import { create } from "zustand";
import type {
  SessionStoreState,
  WebSocketMessage,
  SessionState,
} from "../types/session.types";

export const useSessionStore = create<SessionStoreState>()((set, get) => ({
  isConnected: false,
  sessionState: null,
  messages: [],
  error: null,

  connect: (interviewId: string, token: string) => {
    console.log("Connecting to session:", interviewId);
  },

  disconnect: () => {
    set({
      isConnected: false,
      sessionState: null,
      messages: [],
      error: null,
    });
  },

  sendMessage: (message: Partial<WebSocketMessage>) => {
    console.log("Sending message:", message);
  },

  clearMessages: () => set({ messages: [] }),

  // Internal setters used by useWebSocket hook
  setConnected: (connected: boolean) =>
    set({ isConnected: connected }),

  addMessage: (message: WebSocketMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setError: (error: string | null) => set({ error }),

  setSessionState: (sessionState: SessionState) =>
    set({ sessionState }),
}));