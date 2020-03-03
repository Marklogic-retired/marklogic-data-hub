/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.web;

import java.util.Objects;

import com.marklogic.hub.explorer.WebApplication;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {WebApplication.class})
@WebAppConfiguration
public class AppInfoTest {

  @Autowired
  AppInfoController appInfoController;

  @Autowired
  Environment environment;

  @Test
  public void getInfo() {
    String expectedTimeout = environment.getProperty("server.servlet.session.timeout");
    String actualTimeout = Objects.requireNonNull(appInfoController.getInfo().getBody())
        .get("session.timeout");
    assertEquals(expectedTimeout, actualTimeout);
  }

}
