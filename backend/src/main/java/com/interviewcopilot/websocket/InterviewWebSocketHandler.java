// backend/src/main/java/com/interviewcopilot/websocket/InterviewWebSocketHandler.java
package com.interviewcopilot.websocket;

import com.interviewcopilot.dto.SessionState;
import com.interviewcopilot.dto.WebSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class InterviewWebSocketHandler extends TextWebSocketHandler {

    private final SessionManager sessionManager;

    @Override
    public void afterConnectionEstablished(WebSocketSession session)
            throws Exception {

        String interviewId = extractInterviewId(session);
        sessionManager.addSession(interviewId, session);

        log.info("WebSocket connected: sessionId={}, interviewId={}",
                session.getId(), interviewId);

        String response = String.format(
            "{\"type\":\"SESSION_STARTED\",\"sessionId\":\"%s\"," +
            "\"interviewId\":\"%s\",\"payload\":{\"message\":" +
            "\"Connected to interview session\",\"interviewId\":\"%s\"}" +
            ",\"timestamp\":\"%s\"}",
            session.getId(), interviewId, interviewId,
            LocalDateTime.now()
        );

        sendRaw(session, response);
    }

    @Override
    protected void handleTextMessage(
            WebSocketSession session, TextMessage message) throws Exception {

        String interviewId = extractInterviewId(session);
        sessionManager.updateSessionActivity(interviewId);

        String payload = message.getPayload();
        log.info("Message received for interview: {}", interviewId);

        if (payload.contains("\"type\":\"PING\"")) {
            handlePing(session, interviewId);
        } else if (payload.contains("\"type\":\"JOIN_SESSION\"")) {
            handleJoinSession(session, interviewId);
        } else if (payload.contains("\"type\":\"ANSWER\"")) {
            handleAnswer(session, interviewId);
        } else if (payload.contains("\"type\":\"TYPING\"")) {
            handleTyping(session, interviewId);
        } else {
            handleUnknown(session);
        }
    }

    @Override
    public void afterConnectionClosed(
            WebSocketSession session, CloseStatus status) {

        String interviewId = extractInterviewId(session);
        sessionManager.removeSession(interviewId);

        log.info("WebSocket disconnected: sessionId={}, interviewId={}",
                session.getId(), interviewId, status);
    }

    @Override
    public void handleTransportError(
            WebSocketSession session, Throwable exception) {
        log.error("WebSocket error for session {}: {}",
                session.getId(), exception.getMessage());
    }

    private void handlePing(
            WebSocketSession session, String interviewId) throws Exception {

        String response = String.format(
            "{\"type\":\"PONG\",\"sessionId\":\"%s\"," +
            "\"interviewId\":\"%s\",\"payload\":{\"status\":\"alive\"}," +
            "\"timestamp\":\"%s\"}",
            session.getId(), interviewId, LocalDateTime.now()
        );
        sendRaw(session, response);
    }

    private void handleJoinSession(
            WebSocketSession session, String interviewId) throws Exception {

        SessionState state = sessionManager.createSessionState(
                session.getId(),
                Long.parseLong(interviewId),
                null,
                10
        );

        String response = String.format(
            "{\"type\":\"JOIN_SESSION\",\"sessionId\":\"%s\"," +
            "\"interviewId\":\"%s\",\"payload\":{\"status\":\"%s\"," +
            "\"currentQuestionIndex\":%d,\"totalQuestions\":%d}," +
            "\"timestamp\":\"%s\"}",
            session.getId(), interviewId,
            state.getStatus(),
            state.getCurrentQuestionIndex(),
            state.getTotalQuestions(),
            LocalDateTime.now()
        );

        sendRaw(session, response);
        log.info("User joined session: interviewId={}", interviewId);
    }

    private void handleAnswer(
            WebSocketSession session, String interviewId) throws Exception {

        sessionManager.incrementQuestionIndex(interviewId);

        String response = String.format(
            "{\"type\":\"FEEDBACK\",\"sessionId\":\"%s\"," +
            "\"interviewId\":\"%s\",\"payload\":{\"received\":true," +
            "\"message\":\"Answer received successfully\"}," +
            "\"timestamp\":\"%s\"}",
            session.getId(), interviewId, LocalDateTime.now()
        );
        sendRaw(session, response);
    }

    private void handleTyping(
            WebSocketSession session, String interviewId) throws Exception {

        String response = String.format(
            "{\"type\":\"TYPING\",\"sessionId\":\"%s\"," +
            "\"interviewId\":\"%s\",\"payload\":{\"typing\":true}," +
            "\"timestamp\":\"%s\"}",
            session.getId(), interviewId, LocalDateTime.now()
        );
        sendRaw(session, response);
    }

    private void handleUnknown(WebSocketSession session) throws Exception {
        String response = String.format(
            "{\"type\":\"ERROR\",\"sessionId\":\"%s\"," +
            "\"payload\":{\"message\":\"Unknown message type\"}," +
            "\"timestamp\":\"%s\"}",
            session.getId(), LocalDateTime.now()
        );
        sendRaw(session, response);
    }

    private void sendRaw(WebSocketSession session, String json)
            throws Exception {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(json));
        }
    }

    private String extractInterviewId(WebSocketSession session) {
        String path = session.getUri().getPath();
        String[] parts = path.split("/");
        return parts[parts.length - 1];
    }
}