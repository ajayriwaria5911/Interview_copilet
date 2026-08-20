// frontend/src/pages/InterviewPage.tsx

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../api/axios";
import { useChatStore } from "../store/chatStore";
import ChatWindow from "../components/interview/ChatWindow";
import ChatInput from "../components/interview/ChatInput";
import InterviewHeader from "../components/interview/InterviewHeader";
import QuestionCard from "../components/interview/QuestionCard";
import type { InterviewDto } from "../types/interview.types";
import {
  ChevronRight,
  XCircle,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";

export default function InterviewPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewDto | null>(null);
  const [showQuestionCard, setShowQuestionCard] = useState(true);
  const [isLoadingInterview, setIsLoadingInterview] = useState(true);
  const [isStopped, setIsStopped] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [proctoringWarning, setProctoringWarning] =
    useState<string | null>(null);
  const [isGettingQuestion, setIsGettingQuestion] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [multiPersonCountdown, setMultiPersonCountdown] =
    useState<number | null>(null);
  const [stopRecording, setStopRecording] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isGettingQuestionRef = useRef(false);
  const timeUpCalledRef = useRef(false);
  const proctoringIntervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);
  const multiPersonTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);
  const multiPersonCountdownRef = useRef(0);
  const tabSwitchCountRef = useRef(0);
  const tabWarningTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);
  const multiPersonWarningGivenRef = useRef(false);
  const consecutivePersonRef = useRef(0);

  const {
    messages,
    isLoading,
    isSending,
    isTyping,
    error,
    fetchMessages,
    fetchNextQuestion,
    sendMessage,
    clearChat,
  } = useChatStore();

  // ── Correct question count ────────────────────────────────────────
  const questionMessages = messages.filter((m) => m.isQuestion);
  const questionCount = questionMessages.length;

  // ── Stop interview + camera off ───────────────────────────────────
  const stopInterview = useCallback((reason: string) => {
    setIsStopped(true);
    setStopReason(reason);
    window.speechSynthesis?.cancel();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setCameraReady(false);

    if (proctoringIntervalRef.current) {
      clearInterval(proctoringIntervalRef.current);
      proctoringIntervalRef.current = null;
    }
    if (multiPersonTimerRef.current) {
      clearInterval(multiPersonTimerRef.current);
      multiPersonTimerRef.current = null;
    }
    if (tabWarningTimerRef.current) {
      clearTimeout(tabWarningTimerRef.current);
      tabWarningTimerRef.current = null;
    }
  }, []);

  // ── Camera ────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setCameraReady(true);
        };
      }
    } catch {
      setCameraReady(false);
    }
  }, []);

  // ── Face detection — counts distinct face regions ─────────────────
  const countFaces = useCallback((): number => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return 0;

    const W = 160;
    const H = 120;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, W, H);
    const { data } = ctx.getImageData(0, 0, W, H);

    // Build 20x15 grid of skin-colored cells
    const GRID_W = 20;
    const GRID_H = 15;
    const cellW = W / GRID_W;
    const cellH = H / GRID_H;
    const skinGrid: boolean[] = new Array(GRID_W * GRID_H).fill(false);

    for (let gy = 0; gy < GRID_H; gy++) {
      for (let gx = 0; gx < GRID_W; gx++) {
        let skinCount = 0;
        let total = 0;

        const x0 = Math.floor(gx * cellW);
        const y0 = Math.floor(gy * cellH);
        const x1 = Math.floor((gx + 1) * cellW);
        const y1 = Math.floor((gy + 1) * cellH);

        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const i = (y * W + x) * 4;
            const r = data[i], g = data[i + 1], b = data[i + 2];

            // YCbCr skin detection
            const Y = 0.299 * r + 0.587 * g + 0.114 * b;
            const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
            const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

            const isSkin =
              Y > 60 && Y < 230 &&
              Cb > 75 && Cb < 130 &&
              Cr > 130 && Cr < 175;

            if (isSkin) skinCount++;
            total++;
          }
        }

        skinGrid[gy * GRID_W + gx] = skinCount / total > 0.35;
      }
    }

    // BFS to find connected skin regions
    const visited = new Set<number>();
    let faceCount = 0;

    for (let i = 0; i < skinGrid.length; i++) {
      if (!skinGrid[i] || visited.has(i)) continue;

      // BFS
      const queue = [i];
      visited.add(i);
      const cells: number[] = [];
      let minX = GRID_W, maxX = 0;
      let minY = GRID_H, maxY = 0;

      while (queue.length > 0) {
        const curr = queue.pop()!;
        cells.push(curr);
        const cy = Math.floor(curr / GRID_W);
        const cx = curr % GRID_W;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          curr - 1, curr + 1,
          curr - GRID_W, curr + GRID_W,
        ];

        for (const n of neighbors) {
          if (
            n >= 0 && n < GRID_W * GRID_H &&
            !visited.has(n) && skinGrid[n]
          ) {
            const ny = Math.floor(n / GRID_W);
            const nx = n % GRID_W;
            const dy = Math.abs(ny - cy);
            const dx = Math.abs(nx - cx);
            if (dx <= 1 && dy <= 1) {
              visited.add(n);
              queue.push(n);
            }
          }
        }
      }

      const rW = maxX - minX + 1;
      const rH = maxY - minY + 1;

      // Valid face region:
      // - At least 6 cells
      // - Width and height >= 2 cells
      // - Aspect ratio between 0.4 and 2.5 (face-like)
      // - Not the whole frame (< 85% width)
      const aspect = rH > 0 ? rW / rH : 0;

      if (
        cells.length >= 6 &&
        rW >= 2 && rH >= 2 &&
        aspect > 0.4 && aspect < 2.5 &&
        rW < GRID_W * 0.85
      ) {
        faceCount++;
      }
    }

    return faceCount;
  }, []);

  // ── Proctoring — only face count, NO phone detection ─────────────
  const startProctoring = useCallback(() => {
    if (proctoringIntervalRef.current) return;

    proctoringIntervalRef.current = setInterval(() => {
      if (isStopped || !cameraReady) return;

      const faceCount = countFaces();

      if (faceCount > 1) {
        consecutivePersonRef.current += 1;

        // Need 3 consecutive detections to confirm
        if (consecutivePersonRef.current >= 3) {
          if (!multiPersonWarningGivenRef.current) {
            // First time — WARNING only
            multiPersonWarningGivenRef.current = true;
            consecutivePersonRef.current = 0;
            setProctoringWarning(
              "⚠️ Another person detected in camera! Please ensure only you are visible."
            );
          } else if (!multiPersonTimerRef.current) {
            // Second time — start countdown
            multiPersonCountdownRef.current = 10;
            setMultiPersonCountdown(10);
            setProctoringWarning(null);

            multiPersonTimerRef.current = setInterval(() => {
              multiPersonCountdownRef.current -= 1;
              setMultiPersonCountdown(multiPersonCountdownRef.current);

              if (multiPersonCountdownRef.current <= 0) {
                clearInterval(multiPersonTimerRef.current!);
                multiPersonTimerRef.current = null;
                stopInterview(
                  "Interview stopped: Another person was detected in camera again."
                );
              }
            }, 1000);
          }
        }
      } else {
        // Alone — reset
        consecutivePersonRef.current = 0;

        if (multiPersonTimerRef.current) {
          clearInterval(multiPersonTimerRef.current);
          multiPersonTimerRef.current = null;
          setMultiPersonCountdown(null);
          multiPersonWarningGivenRef.current = false;
          setProctoringWarning(null);
        } else if (proctoringWarning) {
          // Clear warning after 5 sec if person left
          setTimeout(() => setProctoringWarning(null), 5000);
        }
      }
    }, 3000);
  }, [isStopped, cameraReady, countFaces, stopInterview, proctoringWarning]);

  // ── Load interview ────────────────────────────────────────────────
  useEffect(() => {
    if (!interviewId) { navigate("/dashboard"); return; }

    const load = async () => {
      try {
        const { data } = await apiClient.get<InterviewDto>(
          `/api/interviews/${interviewId}`
        );
        setInterview(data);
        await fetchMessages(Number(interviewId));
        await startCamera();
      } catch {
        navigate("/dashboard");
      } finally {
        setIsLoadingInterview(false);
      }
    };

    load();

    return () => {
      clearChat();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (proctoringIntervalRef.current)
        clearInterval(proctoringIntervalRef.current);
      if (multiPersonTimerRef.current)
        clearInterval(multiPersonTimerRef.current);
      if (tabWarningTimerRef.current)
        clearTimeout(tabWarningTimerRef.current);
    };
  }, [interviewId, navigate, fetchMessages, clearChat, startCamera]);

  // ── Start proctoring after camera ready ───────────────────────────
  useEffect(() => {
    if (cameraReady && !isStopped) {
      const t = setTimeout(() => startProctoring(), 3000);
      return () => clearTimeout(t);
    }
  }, [cameraReady, isStopped, startProctoring]);

  // ── Tab switch ────────────────────────────────────────────────────
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) return;
      tabSwitchCountRef.current += 1;
      setTabSwitchCount(tabSwitchCountRef.current);

      if (tabSwitchCountRef.current === 1) {
        setTabSwitchWarning(true);
        window.speechSynthesis?.cancel();
        if (tabWarningTimerRef.current)
          clearTimeout(tabWarningTimerRef.current);
        tabWarningTimerRef.current = setTimeout(
          () => setTabSwitchWarning(false), 8000
        );
      } else if (tabSwitchCountRef.current >= 2) {
        stopInterview(
          "Interview stopped: You switched tabs 2 times. This is not allowed."
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [stopInterview]);

  // ── TTS ───────────────────────────────────────────────────────────
  const speakQuestion = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/^Question \d+:\s*/i, "");
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = "en-US";
    utt.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(
      (v) => v.name.includes("Google") || v.lang.startsWith("en")
    );
    if (v) utt.voice = v;
    window.speechSynthesis.speak(utt);
  }, []);

  // ── Get next question ─────────────────────────────────────────────
  const handleGetQuestion = useCallback(async () => {
    if (!interviewId || isStopped) return;
    if (isGettingQuestionRef.current) return;
    isGettingQuestionRef.current = true;
    setIsGettingQuestion(true);
    setShowQuestionCard(false);
    timeUpCalledRef.current = false;
    setStopRecording(false);

    try {
      await fetchNextQuestion(Number(interviewId));
      setTimerKey((k) => k + 1);
      setTimeout(() => {
        const msgs = useChatStore.getState().messages;
        const last = msgs[msgs.length - 1];
        if (last?.isQuestion) speakQuestion(last.content);
      }, 600);
    } finally {
      isGettingQuestionRef.current = false;
      setIsGettingQuestion(false);
    }
  }, [interviewId, fetchNextQuestion, speakQuestion, isStopped]);

  // ── Send answer ───────────────────────────────────────────────────
  const handleSendMessage = async (content: string) => {
    if (!interviewId || !interview || isStopped) return;
    const questions = messages.filter((m) => m.isQuestion);
    const last = questions[questions.length - 1];

    setStopRecording(true);

    await sendMessage({
      interviewId: Number(interviewId),
      content,
      messageType: "answer",
      questionIndex: last?.questionIndex ?? 0,
    });

    setTimerKey((k) => k + 1);
    setTimeout(() => {
      setShowQuestionCard(true);
      setStopRecording(false);
    }, 800);
  };

  // ── Time up ───────────────────────────────────────────────────────
  const handleTimeUp = useCallback(async () => {
    if (!interviewId || isStopped) return;
    if (timeUpCalledRef.current) return;
    if (isGettingQuestionRef.current) return;
    const last = messages[messages.length - 1];
    if (!last?.isQuestion) return;

    timeUpCalledRef.current = true;
    setStopRecording(true);
    setTimerKey((k) => k + 1);
    await handleGetQuestion();
  }, [interviewId, messages, handleGetQuestion, isStopped]);

  const hasAnsweredLastQuestion = () => {
    if (!messages.length) return false;
    return messages[messages.length - 1].messageType === "feedback";
  };

  const isCompleted = interview?.status === "COMPLETED";
  const allDone = questionCount >= (interview?.totalQuestions ?? 10);

  if (isLoadingInterview) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Starting interview session...</p>
        </div>
      </div>
    );
  }

  if (!interview) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* Fixed header */}
      <div className="sticky top-0 z-50">
        <InterviewHeader
          topic={interview.topic ?? "Interview"}
          jobRole={interview.jobRole ?? ""}
          interviewType={interview.type}
          currentQuestion={questionCount}
          totalQuestions={interview.totalQuestions ?? 10}
          status={interview.status}
          timeLimit={60}
          onTimeUp={handleTimeUp}
          timerKey={timerKey}
          isPaused={isStopped}
        />
      </div>

      {/* Tab switch warning */}
      {tabSwitchWarning && !isStopped && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-6 py-3 flex items-center justify-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 animate-pulse shrink-0" />
          <p className="text-yellow-300 text-sm font-bold">
            ⚠️ Warning ({tabSwitchCount}/2): Tab switch detected!
            One more switch will stop your interview permanently.
          </p>
        </div>
      )}

      {/* Stopped banner */}
      {isStopped && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-center justify-center gap-3 flex-wrap">
          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p className="text-red-400 text-sm font-medium text-center">
            {stopReason}
          </p>
          <button
            onClick={() => navigate("/interview/new")}
            className="shrink-0 px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/30 transition-all"
          >
            New Interview
          </button>
        </div>
      )}

      {/* Multi person countdown */}
      {multiPersonCountdown !== null && !isStopped && (
        <div className="bg-red-500/20 border-b border-red-500/30 px-6 py-3 flex items-center justify-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
          <p className="text-red-300 text-sm font-bold">
            🚨 Another person detected again! Interview stops in{" "}
            {multiPersonCountdown}s...
          </p>
        </div>
      )}

      {/* Proctoring warning */}
      {proctoringWarning && !isStopped && multiPersonCountdown === null && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-2 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          <p className="text-orange-400 text-sm font-medium">
            {proctoringWarning}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2">
          <p className="text-red-400 text-sm text-center">⚠️ {error}</p>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chat column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            isTyping={isTyping}
          />

          {/* First question card */}
          {messages.length === 0 && !isTyping && !isStopped && (
            <QuestionCard
              questionNumber={1}
              totalQuestions={interview.totalQuestions ?? 10}
              topic={interview.topic ?? ""}
              onGetQuestion={handleGetQuestion}
              isLoading={isGettingQuestion}
            />
          )}

          {/* Next question card */}
          {showQuestionCard &&
            hasAnsweredLastQuestion() &&
            !allDone &&
            !isCompleted &&
            !isStopped && (
              <QuestionCard
                questionNumber={questionCount + 1}
                totalQuestions={interview.totalQuestions ?? 10}
                topic={interview.topic ?? ""}
                onGetQuestion={handleGetQuestion}
                isLoading={isTyping || isGettingQuestion}
              />
            )}

          {/* Skip button */}
          {!hasAnsweredLastQuestion() &&
            messages.length > 0 &&
            !allDone &&
            !isCompleted &&
            !isStopped && (
              <div className="px-4 pb-2 flex justify-end">
                <button
                  onClick={handleGetQuestion}
                  disabled={isGettingQuestion || isTyping}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/80 hover:bg-slate-600 disabled:opacity-40 text-slate-300 text-xs font-medium rounded-lg transition-all border border-slate-600"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Skip to Next Question
                </button>
              </div>
            )}

          {/* Completed */}
          {allDone && (
            <div className="mx-4 mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
              <p className="text-green-400 font-semibold text-lg">
                🎉 Interview Complete!
              </p>
              <p className="text-slate-400 text-sm mt-1">
                All {interview.totalQuestions} questions done.
              </p>
              <button
                onClick={() => navigate("/dashboard")}
                className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-xl transition-all"
              >
                View Results →
              </button>
            </div>
          )}

          {/* Chat input */}
          <ChatInput
            onSend={handleSendMessage}
            isSending={isSending}
            forceStop={stopRecording}
            questionIndex={Math.max(0, questionCount - 1)}
            disabled={
              messages.length === 0 ||
              isTyping ||
              allDone ||
              isCompleted ||
              hasAnsweredLastQuestion() ||
              isStopped
            }
          />
        </div>

        {/* Camera panel */}
        <div className="w-56 shrink-0 border-l border-slate-800 bg-slate-900 flex flex-col items-center py-4 px-3 gap-3">

          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
            🎥 Live Camera
          </p>

          <div
            className="relative w-full rounded-xl overflow-hidden border-2 border-slate-700 bg-slate-800"
            style={{ aspectRatio: "4/3" }}
          >
            {isStopped ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900">
                <XCircle className="w-10 h-10 text-red-400" />
                <p className="text-red-400 text-xs font-medium">Camera Off</p>
                <p className="text-slate-600 text-xs">Interview ended</p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: "scaleX(-1)",
                  }}
                />
                <canvas ref={canvasRef} style={{ display: "none" }} />

                {!cameraReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-800">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 text-xs">Starting...</p>
                  </div>
                )}

                {cameraReady && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 px-1.5 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-xs font-bold">LIVE</span>
                  </div>
                )}

                {tabSwitchCount > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-500/90 px-1.5 py-0.5 rounded-full">
                    <span className="text-black text-xs font-bold">
                      ⚠️ {tabSwitchCount}/2
                    </span>
                  </div>
                )}

                {multiPersonCountdown !== null && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-900/70">
                    <div className="text-center">
                      <p className="text-white text-5xl font-bold">
                        {multiPersonCountdown}
                      </p>
                      <p className="text-red-300 text-xs mt-1">
                        Multiple persons!
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Proctoring status */}
          <div className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <p className="text-slate-400 text-xs font-medium">
                AI Proctoring
              </p>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              {isStopped
                ? "❌ Stopped — Camera Off"
                : multiPersonCountdown !== null
                ? `🔴 Stopping in ${multiPersonCountdown}s`
                : proctoringWarning
                ? "⚠️ Warning issued"
                : cameraReady
                ? "✅ Active — monitoring faces"
                : "⏳ Starting..."}
            </p>
          </div>

          {/* Rules */}
          <div className="w-full space-y-1.5 pt-2 border-t border-slate-800">
            <p className="text-slate-600 text-xs font-medium uppercase tracking-wider">
              Rules
            </p>
            {[
              { text: "One person only", warn: true },
              { text: "Max 2 tab switches", warn: true },
              { text: "Stay in frame", warn: true },
              { text: "No external help", warn: true },
              { text: "Speak clearly", warn: false },
              { text: "Look at camera", warn: false },
            ].map(({ text, warn }) => (
              <p
                key={text}
                className="text-slate-500 text-xs flex items-start gap-1.5"
              >
                <span
                  className={
                    warn
                      ? "text-red-500 shrink-0"
                      : "text-green-500 shrink-0"
                  }
                >
                  {warn ? "✗" : "✓"}
                </span>
                {text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}