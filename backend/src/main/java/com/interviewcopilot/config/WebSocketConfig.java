// backend/src/main/java/com/interviewcopilot/config/WebSocketConfig.java
package com.interviewcopilot.config;

import com.interviewcopilot.websocket.InterviewWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final InterviewWebSocketHandler interviewWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(
            WebSocketHandlerRegistry registry) {

        registry
            .addHandler(interviewWebSocketHandler, "/ws/interview/{interviewId}")
            .setAllowedOrigins(
                "http://localhost:5173",
                "http://localhost:3000"
            );
    }
}