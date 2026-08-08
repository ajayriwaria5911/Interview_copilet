// frontend/src/types/session.types.ts

export interface WebSocketMessage {
  type: string;
  sessionId: string;
  userId?: string;
  interviewId: string;
  payload: unknown;
  timestamp: string;
}

export type MessageType =
  | "JOIN_SESSION"
  | "LEAVE_SESSION"
  | "QUESTION"
  | "ANSWER"
  | "FEEDBACK"
  | "TYPING"
  | "SESSION_STARTED"
  | "SESSION_ENDED"
  | "ERROR"
  | "PING"
  | "PONG";

export interface SessionState {
  sessionId: string;
  interviewId: number;
  userId: number;
  status: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: string[];
  startedAt: string;
  lastActivityAt: string;
}

export interface SessionStoreState {
  isConnected: boolean;
  sessionState: SessionState | null;
  messages: WebSocketMessage[];
  error: string | null;
  connect: (interviewId: string, token: string) => void;
  disconnect: () => void;
  sendMessage: (message: Partial<WebSocketMessage>) => void;
  clearMessages: () => void;
}
// Add these to SessionStoreState interface
export interface SessionStoreState {
  isConnected: boolean;
  sessionState: SessionState | null;
  messages: WebSocketMessage[];
  error: string | null;
  connect: (interviewId: string, token: string) => void;
  disconnect: () => void;
  sendMessage: (message: Partial<WebSocketMessage>) => void;
  clearMessages: () => void;
  // Internal setters
  setConnected: (connected: boolean) => void;
  addMessage: (message: WebSocketMessage) => void;
  setError: (error: string | null) => void;
  setSessionState: (sessionState: SessionState) => void;
}