package com.marklogic.hub.web;

import com.marklogic.hub.ApplicationConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebApplication {

	public static void main(String[] args) {
        SpringApplication.run(new Class[] { WebApplication.class, ApplicationConfig.class } , args);
	}

}
