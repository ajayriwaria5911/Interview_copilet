// frontend/src/components/interview/MessageBubble.tsx

import { useState } from "react";
import {
  BrainCircuit, User, Lightbulb, HelpCircle,
  Volume2, VolumeX, Loader2
} from "lucide-react";
import type { ChatMessage } from "../../types/chat.types";

interface Props {
  message: ChatMessage;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";
  const isQuestion = message.isQuestion;
  const isFeedback = message.messageType === "feedback";
  const [isSpeaking, setIsSpeaking] = useState(false);

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Remove "Question X:" prefix for cleaner speech
    const cleanText = text.replace(/^Question \d+:\s*/i, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to use a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.name.includes("Google") ||
        v.name.includes("Natural") ||
        v.lang === "en-US"
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (isQuestion) {
    return (
      <div className="flex gap-3 mb-6">
        <div className="bg-indigo-500/20 p-2 rounded-xl h-fit shrink-0">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-indigo-400 font-semibold text-sm">
              InterviewCopilot AI
            </span>
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
              Question
            </span>
          </div>
          <div className="bg-slate-800 border border-indigo-500/20 rounded-2xl rounded-tl-none p-4">
            <p className="text-white text-sm leading-relaxed">
              {message.content}
            </p>

            {/* Speak button */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
              <p className="text-slate-500 text-xs">
                Click to hear the question
              </p>
              <button
                onClick={() => speakText(message.content)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSpeaking
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    Listen
                  </>
                )}
              </button>
            </div>
          </div>
          {message.createdAt && (
            <p className="text-slate-600 text-xs mt-1 ml-1">
              {formatTime(message.createdAt)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isFeedback) {
    return (
      <div className="flex gap-3 mb-6">
        <div className="bg-yellow-500/20 p-2 rounded-xl h-fit shrink-0">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 font-semibold text-sm">
              AI Feedback
            </span>
            <button
              onClick={() => speakText(message.content)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs transition-all ${
                isSpeaking
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {isSpeaking
                ? <VolumeX className="w-3 h-3" />
                : <Volume2 className="w-3 h-3" />
              }
            </button>
          </div>
          <div className="bg-slate-800 border border-yellow-500/20 rounded-2xl rounded-tl-none p-4">
            <p className="text-slate-300 text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
          {message.createdAt && (
            <p className="text-slate-600 text-xs mt-1 ml-1">
              {formatTime(message.createdAt)}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex gap-3 mb-6 flex-row-reverse">
        <div className="bg-slate-700 p-2 rounded-xl h-fit shrink-0">
          <User className="w-5 h-5 text-slate-300" />
        </div>
        <div className="flex-1 flex flex-col items-end">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-slate-400 font-semibold text-sm">
              You
            </span>
          </div>
          <div className="bg-indigo-600 rounded-2xl rounded-tr-none p-4 max-w-lg">
            <p className="text-white text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
          {message.createdAt && (
            <p className="text-slate-600 text-xs mt-1 mr-1">
              {formatTime(message.createdAt)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-6">
      <div className="bg-slate-700 p-2 rounded-xl h-fit shrink-0">
        <BrainCircuit className="w-5 h-5 text-slate-300" />
      </div>
      <div className="flex-1">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none p-4">
          <p className="text-slate-300 text-sm leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}