// backend/src/main/java/com/interviewcopilot/controller/WebSocketController.java
package com.interviewcopilot.controller;

import com.interviewcopilot.dto.SessionState;
import com.interviewcopilot.websocket.SessionManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class WebSocketController {

    private final SessionManager sessionManager;

    @GetMapping("/{interviewId}/state")
    public ResponseEntity<SessionState> getSessionState(
            @PathVariable String interviewId,
            Authentication authentication) {

        Optional<SessionState> state = sessionManager
                .getSessionState(interviewId);

        return state.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{interviewId}/active")
    public ResponseEntity<Map<String, Object>> isSessionActive(
            @PathVariable String interviewId,
            Authentication authentication) {

        boolean active = sessionManager.hasSession(interviewId);
        return ResponseEntity.ok(Map.of(
                "interviewId", interviewId,
                "active", active
        ));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> getActiveSessionCount(
            Authentication authentication) {

        return ResponseEntity.ok(Map.of(
                "activeSessionCount",
                sessionManager.getActiveSessionCount()
        ));
    }
}