package com.marklogic.hub.central.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.WebSecurityEnablerConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.util.concurrent.ListenableFuture;
import org.springframework.web.socket.WebSocketExtension;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.websocket.*;
import java.lang.reflect.Type;
import java.net.URI;
import java.util.*;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.assertEquals;

// Disable WebSocket security for test
@SpringBootTest(properties = {"hub.websocket.securityDisabled=true"}, webEnvironment= SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SessionManagerTest {
    long testTimeoutBetweenSessionUpdates = 0;
    @Autowired
    SimpMessagingTemplate template;
    @LocalServerPort
    int port;
    BlockingQueue<String> blockingQueue;
    WebSocketStompClient stompClient;
    static final String webSocketTopicPrefix = "/topic/sessionStatus/";

    @Test
    public void testWebSocketSessionMessages() throws Exception {
        SessionMonitorInterceptor sessionMonitorInterceptor = new SessionMonitorInterceptor(template);
        sessionMonitorInterceptor.setTimeBetweenSessionUpdates(testTimeoutBetweenSessionUpdates);
        HttpServletRequest httpServletRequest = new MockHttpServletRequest();
        MockHttpSession session = (MockHttpSession) httpServletRequest.getSession(true);
        HttpServletResponse httpServletResponse = new MockHttpServletResponse();
        Object handler = new Object();
        session.setAttribute("hubCentralSessionToken", UUID.randomUUID().toString());
        blockingQueue = new LinkedBlockingDeque<>();
        WebSocketContainer container = ContainerProvider.getWebSocketContainer();
        stompClient = new WebSocketStompClient(new SockJsClient(
                Arrays.asList(new WebSocketTransport(new StandardWebSocketClient()))));
        StompSession stompSession = stompClient
                .connect(String.format("ws://localhost:%d/websocket", port), new StompSessionHandlerAdapter() {})
                .get(1, TimeUnit.SECONDS);
        stompSession.subscribe(webSocketTopicPrefix + session.getAttribute("hubCentralSessionToken"), new DefaultStompFrameHandler());
        assertEquals(0, blockingQueue.size(), "STOMP Queue should have no messages");
        sessionMonitorInterceptor.preHandle(httpServletRequest, httpServletResponse, handler);
        String stompMsg = blockingQueue.poll(5, TimeUnit.SECONDS);
        JsonNode stompMsgJson = new ObjectMapper().readTree(stompMsg);
        assertEquals(session.getMaxInactiveInterval(), stompMsgJson.path("sessionTimeout").asInt(), "STOMP message should provide the session timeout");
        stompSession.disconnect();
    }

    class DefaultStompFrameHandler implements StompFrameHandler {
        @Override
        public Type getPayloadType(StompHeaders stompHeaders) {
            return byte[].class;
        }

        @Override
        public void handleFrame(StompHeaders stompHeaders, Object o) {
            blockingQueue.offer(new String((byte[]) o));
        }
    }
}

