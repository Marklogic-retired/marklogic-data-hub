package com.marklogic.hub.central.auth;

import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

public class SessionMonitorInterceptor implements HandlerInterceptor {
    static final Map<String, Object> stompHeaders = new HashMap<String, Object>() {{
        put("content-type","application/json");
    }};

    private long timeBetweenSessionUpdates = 1000;
    private SimpMessagingTemplate template;

    public SessionMonitorInterceptor(SimpMessagingTemplate template) {
        this.template = template;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request, @NotNull HttpServletResponse response, @NotNull Object handler) throws Exception {
        HttpSession session = request.getSession();
        // If last accessed was less than a second ago, don't bother with additional WebSocket traffic
        if ((System.currentTimeMillis() - session.getLastAccessedTime()) >= timeBetweenSessionUpdates) {
            int sessionTimeout = session.getMaxInactiveInterval();
            template.convertAndSend("/topic/sessionStatus/" + session.getAttribute("hubCentralSessionToken"), new SessionStatus(sessionTimeout), stompHeaders);
        }
        return true;
    }

    protected void setTimeBetweenSessionUpdates(long timeInMillis) {
        this.timeBetweenSessionUpdates = timeInMillis;
    }

    static class SessionStatus {
        public int sessionTimeout;
        public SessionStatus(int sessionTimeout) {
            this.sessionTimeout = sessionTimeout;
        }
    }
}
