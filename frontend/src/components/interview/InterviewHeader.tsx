// frontend/src/components/interview/InterviewHeader.tsx

import { useState, useEffect } from "react";
import { ArrowLeft, Clock, CheckCircle, BrainCircuit, Timer } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  topic: string;
  jobRole: string;
  interviewType: string;
  currentQuestion: number;
  totalQuestions: number;
  status: string;
  timeLimit?: number;
  onTimeUp?: () => void;
  timerKey?: number;
  isPaused?: boolean;
}

export default function InterviewHeader({
  topic,
  jobRole,
  interviewType,
  currentQuestion,
  totalQuestions,
  status,
  timeLimit = 60,
  onTimeUp,
  timerKey = 0,
  isPaused = false,
}: Props) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const progress = (currentQuestion / totalQuestions) * 100;

  // Reset timer when timerKey or question changes
  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [timerKey, currentQuestion, timeLimit]);

  // Countdown
  useEffect(() => {
    if (currentQuestion === 0) return;
    if (status === "COMPLETED") return;
    if (isPaused) return;
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, currentQuestion, status, isPaused, onTimeUp]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const getTimerColor = () => {
    if (isPaused) return "text-yellow-400";
    if (timeLeft > 30) return "text-green-400";
    if (timeLeft > 15) return "text-yellow-400";
    return "text-red-400";
  };

  const getTimerBg = () => {
    if (isPaused) return "bg-yellow-500/10 border-yellow-500/20";
    if (timeLeft > 30) return "bg-green-500/10 border-green-500/20";
    if (timeLeft > 15) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20 animate-pulse";
  };

  const typeColor: Record<string, string> = {
    TECHNICAL: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    BEHAVIORAL: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    CODING: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-indigo-500/20 p-1.5 rounded-lg">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-sm">{topic}</h1>
                <p className="text-slate-400 text-xs">{jobRole}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentQuestion > 0 && status !== "COMPLETED" && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold ${getTimerBg()} ${getTimerColor()}`}>
                <Timer className="w-4 h-4" />
                {isPaused ? "PAUSED" : formatTime(timeLeft)}
              </div>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${typeColor[interviewType] ?? typeColor.TECHNICAL}`}>
              {interviewType}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              {status === "COMPLETED"
                ? <CheckCircle className="w-4 h-4 text-green-400" />
                : <Clock className="w-4 h-4" />
              }
              <span>{currentQuestion}/{totalQuestions} Questions</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}