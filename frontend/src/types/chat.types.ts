// frontend/src/types/chat.types.ts

export interface ChatMessage {
  id: string;
  interviewId: number;
  userId: number;
  role: "user" | "assistant";
  content: string;
  messageType: string;
  questionIndex: number | null;
  score: number | null;
  isQuestion: boolean;
  topic: string | null;
  createdAt: string | null;
}

export interface ConversationDto {
  interviewId: number;
  interviewType: string;
  topic: string;
  jobRole: string;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  messages: ChatMessage[];
}

export interface SendMessageRequest {
  interviewId: number;
  content: string;
  messageType: string;
  questionIndex: number | null;
}

export interface ChatStoreState {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  isTyping: boolean;
  error: string | null;
  currentQuestionIndex: number;
  conversation: ConversationDto | null;
  fetchMessages: (interviewId: number) => Promise<void>;
  fetchNextQuestion: (interviewId: number) => Promise<void>;
  sendMessage: (request: SendMessageRequest) => Promise<void>;
  clearChat: () => void;
  setTyping: (typing: boolean) => void;
}