package com.marklogic.explorer.integral;

import static com.marklogic.explorer.integral.AppConfig.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("AppConfigTest")
public class AppConfigTest {

  @Test
  void testIt() {

    assertNotNull(config);
    // this is the primary difference between the current main and test versions
    assertEquals("totally_unreal.txt", config.getString("explorer.ofile"));

    assertEquals("http", config.getString("explorer.protocol"));
    assertEquals("localhost", config.getString("explorer.server"));
    assertEquals(8080, config.getInt("explorer.port"));

    assertEquals("ladida", config.getString("explorer.analyst"));
    assertEquals("ladida", config.getString("explorer.analyst_password"));

    assertEquals("gina", config.getString("explorer.arch"));
    assertEquals("gina", config.getString("explorer.arch_password"));
  }
}
