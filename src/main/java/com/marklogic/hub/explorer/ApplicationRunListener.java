/** Copyright 2019 MarkLogic Corporation. All rights reserved. */
package com.marklogic.hub.explorer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringApplicationRunListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;

public class ApplicationRunListener implements SpringApplicationRunListener {

  @Autowired
  Environment environment;

  public ApplicationRunListener(SpringApplication application, String[] args) {
  }

  @Override
  public void starting() {
  }

  @Override
  public void environmentPrepared(ConfigurableEnvironment environment) {
  }

  @Override
  public void contextPrepared(ConfigurableApplicationContext context) {
  }

  @Override
  public void contextLoaded(ConfigurableApplicationContext context) {
  }

  @Override
  public void started(ConfigurableApplicationContext context) {
    String port = context.getEnvironment().getProperty("local.server.port");
    String scheme =
        context.getEnvironment().getProperty("server.ssl.key-store") != null ? "https" : "http";
    System.out.println("Web UI is Ready and Listening on port " + port + ".\n");
    System.out.println("Open your browser to " + scheme + "://localhost:" + port
        + ".\t(We recommend you use Chrome or FireFox.)");
  }

  @Override
  public void running(ConfigurableApplicationContext context) {
  }

  @Override
  public void failed(ConfigurableApplicationContext context, Throwable exception) {
    throw new RuntimeException(exception);
  }
}
