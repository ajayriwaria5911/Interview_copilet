// backend/src/main/java/com/interviewcopilot/websocket/SessionManager.java
package com.interviewcopilot.websocket;

import com.interviewcopilot.dto.SessionState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class SessionManager {

    // interviewId -> WebSocketSession
    private final Map<String, WebSocketSession> activeSessions
            = new ConcurrentHashMap<>();

    // interviewId -> SessionState
    private final Map<String, SessionState> sessionStates
            = new ConcurrentHashMap<>();

    public void addSession(String interviewId, WebSocketSession session) {
        activeSessions.put(interviewId, session);
        log.info("Session added for interview: {}", interviewId);
    }

    public void removeSession(String interviewId) {
        activeSessions.remove(interviewId);
        sessionStates.remove(interviewId);
        log.info("Session removed for interview: {}", interviewId);
    }

    public Optional<WebSocketSession> getSession(String interviewId) {
        return Optional.ofNullable(activeSessions.get(interviewId));
    }

    public boolean hasSession(String interviewId) {
        return activeSessions.containsKey(interviewId);
    }

    public SessionState createSessionState(
            String sessionId,
            Long interviewId,
            Long userId,
            Integer totalQuestions) {

        SessionState state = SessionState.builder()
                .sessionId(sessionId)
                .interviewId(interviewId)
                .userId(userId)
                .status("ACTIVE")
                .currentQuestionIndex(0)
                .totalQuestions(totalQuestions)
                .answeredQuestions(new ArrayList<>())
                .startedAt(LocalDateTime.now())
                .lastActivityAt(LocalDateTime.now())
                .build();

        sessionStates.put(String.valueOf(interviewId), state);
        return state;
    }

    public Optional<SessionState> getSessionState(String interviewId) {
        return Optional.ofNullable(sessionStates.get(interviewId));
    }

    public void updateSessionActivity(String interviewId) {
        SessionState state = sessionStates.get(interviewId);
        if (state != null) {
            state.setLastActivityAt(LocalDateTime.now());
        }
    }

    public void incrementQuestionIndex(String interviewId) {
        SessionState state = sessionStates.get(interviewId);
        if (state != null) {
            state.setCurrentQuestionIndex(
                    state.getCurrentQuestionIndex() + 1);
        }
    }

    public int getActiveSessionCount() {
        return activeSessions.size();
    }

    public Map<String, SessionState> getAllSessionStates() {
        return sessionStates;
    }
}