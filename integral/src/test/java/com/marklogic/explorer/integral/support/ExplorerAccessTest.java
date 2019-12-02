package com.marklogic.explorer.integral.support;

import static com.marklogic.explorer.integral.support.ExplorerAccess.*;
import static com.marklogic.explorer.integral.AppConfig.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Arrays;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("ExplorerAccess Test")
public class ExplorerAccessTest {

  @Test
  void testProtocol() {
    var access = new ExplorerAccess();
    var protocol = Protocol.values();
    assertTrue(protocol.length == 2);
    Arrays.stream(protocol).forEach(i -> assertTrue(i.name().contains("HTTP")));
    var httpProtocol = Protocol.HTTP;
    assertTrue(httpProtocol.getProtocol() == "http");
    assertTrue(access.composeAddress(httpProtocol,"bogusserver.energy","nowhere").equals("http://bogusserver.energy/nowhere"));
  }

  @Test
  void testLoginPayload() {
    var payload = ExplorerAccess.loginPayload("jane", "not_a_chimp");
    assertTrue(payload.equals("{\"username\":\"jane\",\"password\":\"not_a_chimp\"}"));
  }

  @Test
  void testCreateSimpleClient() {
    var client = new ExplorerAccess().simpleClient();
    assertNotNull(client);
    assertTrue(client.authenticator().isEmpty());
  }

  @Test
  void testSecureClient() {
    var client = new ExplorerAccess().secureClient("jane", "not_a_chimp");
    assertNotNull(client);
    assertNotNull(client.cookieHandler());
    assertTrue(client.cookieHandler().isPresent());
  }
}
