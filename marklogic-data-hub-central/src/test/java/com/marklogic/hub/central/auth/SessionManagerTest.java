package com.marklogic.hub.central.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.websocket.ContainerProvider;
import javax.websocket.WebSocketContainer;
import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.TimeUnit;

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

    // TODO Determine why this test fails in CI/CD pipeline
    // @Test
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

