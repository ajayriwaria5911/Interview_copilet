// frontend/src/types/interview.types.ts

export interface InterviewDto {
  id: number;
  type: string;
  status: string;
  topic: string;
  jobRole: string;
  experienceLevel: string;
  overallScore: number | null;
  durationMinutes: number | null;
  totalQuestions: number;
  answeredQuestions: number | null;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface CreateInterviewRequest {
  type: string;
  topic: string;
  jobRole: string;
  experienceLevel: string;
  totalQuestions: number;
}

export interface InterviewHistoryDto {
  id: number;
  type: string;
  status: string;
  topic: string;
  jobRole: string;
  experienceLevel: string;
  overallScore: number | null;
  durationMinutes: number | null;
  totalQuestions: number;
  answeredQuestions: number | null;
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  questions: QuestionDto[];
  feedbacks: FeedbackDto[];
}

export interface QuestionDto {
  id: number;
  interviewId: number;
  questionText: string;
  expectedAnswer: string | null;
  userAnswer: string | null;
  type: string;
  difficulty: string;
  topic: string | null;
  score: number | null;
  orderIndex: number | null;
  answered: boolean | null;
  timeTakenSeconds: number | null;
}

export interface FeedbackDto {
  id: number;
  interviewId: number;
  questionId: number | null;
  feedbackText: string | null;
  strengths: string | null;
  weaknesses: string | null;
  improvements: string | null;
  score: number | null;
  type: string;
  aiModel: string | null;
  createdAt: string | null;
}

export interface InterviewStoreState {
  interviews: InterviewDto[];
  selectedInterview: InterviewDto | null;
  isLoading: boolean;
  error: string | null;
  fetchInterviews: () => Promise<void>;
  createInterview: (
    request: CreateInterviewRequest
  ) => Promise<InterviewDto>;
  startInterview: (id: number) => Promise<void>;
  selectInterview: (interview: InterviewDto | null) => void;
}