// frontend/src/hooks/useWebSocket.ts

import { useEffect, useRef, useCallback } from "react";
import { useSessionStore } from "../store/sessionStore";
import { useAuthStore } from "../store/authStore";
import type { WebSocketMessage } from "../types/session.types";

const WS_URL = "ws://localhost:8082/ws/interview";

export function useWebSocket(interviewId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { accessToken } = useAuthStore();
  const { setConnected, addMessage, setError, setSessionState } =
    useSessionStore();

  const connect = useCallback(() => {
    if (!interviewId || !accessToken) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = `${WS_URL}/${interviewId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
      console.log("WebSocket connected for interview:", interviewId);

      // Send join message
      ws.send(JSON.stringify({
        type: "JOIN_SESSION",
        interviewId,
        timestamp: new Date().toISOString(),
      }));

      // Start ping every 30 seconds
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "PING",
            interviewId,
            timestamp: new Date().toISOString(),
          }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        addMessage(message);

        if (message.type === "JOIN_SESSION" && message.payload) {
          setSessionState(message.payload as any);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket connection error");
      setConnected(false);
    };

    ws.onclose = (event) => {
      setConnected(false);
      console.log("WebSocket closed:", event.code, event.reason);

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      // Auto reconnect after 3 seconds if not intentional
      if (event.code !== 1000) {
        setTimeout(() => connect(), 3000);
      }
    };
  }, [interviewId, accessToken, setConnected, addMessage,
      setError, setSessionState]);

  const disconnect = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    setConnected(false);
  }, [setConnected]);

  const sendMessage = useCallback(
    (message: Partial<WebSocketMessage>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          ...message,
          interviewId,
          timestamp: new Date().toISOString(),
        }));
      } else {
        console.warn("WebSocket not connected");
      }
    },
    [interviewId]
  );

  useEffect(() => {
    if (interviewId) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [interviewId, connect, disconnect]);

  return { connect, disconnect, sendMessage };
}