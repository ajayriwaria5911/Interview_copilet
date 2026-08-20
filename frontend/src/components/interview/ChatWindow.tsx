// frontend/src/components/interview/ChatWindow.tsx

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import MessageBubble from "./MessageBubble";
import type { ChatMessage } from "../../types/chat.types";

interface Props {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
}

export default function ChatWindow({
  messages,
  isLoading,
  isTyping,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-indigo-500/10 p-6 rounded-full mb-4 mx-auto w-fit">
            <Loader2 className="w-10 h-10 text-indigo-400" />
          </div>
          <p className="text-white font-medium text-lg">
            Ready to Start?
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Click "Get Question" to begin your interview
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 mb-6">
            <div className="bg-indigo-500/20 p-2 rounded-xl h-fit">
              <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}