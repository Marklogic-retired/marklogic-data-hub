package com.marklogic.explorer.integral;

import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("AbstractStep Test")
public class AbstractStepTest {

  @Test
  void testComposeServer() {
    var testStep = new AbstractStep();
    assertTrue(testStep.composeServer("localhost", "80").equals("localhost"));
    assertTrue(testStep.composeServer("localhost", "443").equals("localhost"));
    assertTrue(testStep.composeServer("localhost", "8080").equals("localhost:8080"));
    assertTrue(testStep.composeServer("localhost", "8443").equals("localhost:8443"));
  }

}
