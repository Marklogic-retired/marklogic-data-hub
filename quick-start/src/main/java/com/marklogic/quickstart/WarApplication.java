package com.marklogic.quickstart;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class WarApplication extends SpringBootServletInitializer {
    public static void main(String[] args) {
        SpringApplication.run(WarApplication.class, args);
    }
}
