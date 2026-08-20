// frontend/src/components/interview/ChatInput.tsx

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Mic, Square } from "lucide-react";

interface Props {
  onSend: (content: string) => void;
  isSending: boolean;
  disabled: boolean;
  placeholder?: string;
  forceStop?: boolean;
  questionIndex?: number;
}

export default function ChatInput({
  onSend,
  isSending,
  disabled,
  placeholder = "Type your answer or use microphone...",
  forceStop = false,
  questionIndex = 0,
}: Props) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalTranscriptRef = useRef("");
  const shouldRestartRef = useRef(false);
  const prevQuestionIndexRef = useRef(questionIndex);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SR) setIsSupported(true);
    return () => {
      stopTimer();
      shouldRestartRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  // ── Reset recording on question change ────────────────────────────
  useEffect(() => {
    if (questionIndex !== prevQuestionIndexRef.current) {
      prevQuestionIndexRef.current = questionIndex;

      // Stop current recording for previous question
      if (isListening) {
        shouldRestartRef.current = false;
        try { recognitionRef.current?.stop(); } catch {}
        setIsListening(false);
        stopTimer();
      }

      // Clear input for new question
      setInput("");
      finalTranscriptRef.current = "";
    }
  }, [questionIndex, isListening]);

  // ── Force stop when answer submitted ─────────────────────────────
  useEffect(() => {
    if (forceStop && isListening) {
      shouldRestartRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
      setIsListening(false);
      stopTimer();
    }
  }, [forceStop, isListening]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const startTimer = () => {
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((p) => p + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const createRecognition = useCallback(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return null;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t + " ";
        } else {
          interim += t;
        }
      }
      finalTranscriptRef.current += final;
      setInput(finalTranscriptRef.current + interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setPermissionDenied(true);
        setIsListening(false);
        shouldRestartRef.current = false;
        stopTimer();
      }
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try { recognitionRef.current?.start(); } catch {}
      } else {
        setIsListening(false);
        stopTimer();
        setInput(finalTranscriptRef.current.trim());
      }
    };

    return recognition;
  }, []);

  const startListening = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionDenied(false);
      finalTranscriptRef.current = "";
      setInput("");
      shouldRestartRef.current = true;
      const recognition = createRecognition();
      if (!recognition) return;
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      startTimer();
    } catch {
      setPermissionDenied(true);
    }
  };

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
    stopTimer();
    setInput(finalTranscriptRef.current.trim());
  }, []);

  const handleSend = () => {
    if (!input.trim() || isSending || disabled) return;
    if (isListening) stopListening();
    onSend(input.trim());
    setInput("");
    finalTranscriptRef.current = "";
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ FIXED: Show current question number correctly
  const displayQuestionNumber = questionIndex + 1;

  return (
    <div className="bg-slate-900 border-t border-slate-800 px-4 py-4">
      <div className="max-w-4xl mx-auto">

        {isListening && (
          <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="flex gap-1 items-end">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 bg-red-400 rounded-full animate-bounce"
                  style={{
                    height: `${12 + i * 4}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-red-400 text-sm font-medium">
              🎙️ Recording Q{displayQuestionNumber}... {formatTime(recordingTime)}
            </span>
            <span className="text-slate-500 text-xs">(speak clearly)</span>
          </div>
        )}

        {permissionDenied && (
          <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-400 text-xs text-center">
              ⚠️ Microphone denied. Click 🔒 in address bar to allow.
            </p>
          </div>
        )}

        <div className="flex items-end gap-3 bg-slate-800 border border-slate-700 rounded-2xl p-3 focus-within:border-indigo-500 transition-all">

          {isSupported && (
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={disabled || isSending}
              title={isListening ? "Stop recording" : "Start voice input"}
              className={`p-2.5 rounded-xl transition-all shrink-0 ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300 disabled:opacity-40"
              }`}
            >
              {isListening
                ? <Square className="w-4 h-4" />
                : <Mic className="w-4 h-4" />
              }
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? "Get the next question first..."
                : isListening
                ? `Recording answer for Q${displayQuestionNumber}...`
                : placeholder
            }
            disabled={disabled || isSending}
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm resize-none focus:outline-none max-h-48 py-1"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending || disabled}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shrink-0"
          >
            {isSending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-slate-600 text-xs">
            Enter to send · Shift+Enter new line
          </p>
          {isSupported && !permissionDenied && (
            <p className="text-slate-600 text-xs">
              {isListening
                ? `🔴 Recording Q${displayQuestionNumber} — Click ■ to stop`
                : "🎤 Click mic to speak your answer"
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
}