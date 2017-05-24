package com.marklogic.quickstart;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringApplicationRunListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;

public class ApplicationRunListener implements SpringApplicationRunListener {

    @Autowired
    Environment environment;

    public ApplicationRunListener(SpringApplication application, String[] args) { }

    @Override
    public void starting() {
        System.out.println("Starting up the QuickStart UI...");
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
    public void finished(ConfigurableApplicationContext context, Throwable exception) {
        String port = context.getEnvironment().getProperty("local.server.port");
        System.out.println("QuickStart UI Ready and Listening on port " + port);
        System.out.println("http://localhost:" + port);
    }
}
