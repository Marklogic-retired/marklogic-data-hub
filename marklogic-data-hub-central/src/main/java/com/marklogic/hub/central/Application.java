/*
 * Copyright 2012-2021 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.central;

import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.CommonsRequestLoggingFilter;

import java.util.Set;
import java.util.stream.Stream;

/**
 * The Hub Central application does not autowire any beans defined in Data Hub core. This is done to avoid any
 * dependency on a Spring-managed HubConfig instance, which combines both application-wide configuration and
 * user-specific authentication information. HubConfig also depends on a HubProject, which does not exist in
 * Hub Central.
 * <p>
 * Hub Central beans should depend on HubClient instead, as Hub Central is expected to have a session-scoped
 * implementation of this interface.
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.marklogic.hub.central")
public class Application {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(Application.class);
        app.setBannerMode(Banner.Mode.OFF);
        app.run(args);
    }

    @Bean
    public CommonsRequestLoggingFilter requestLoggingFilter() {
        CommonsRequestLoggingFilter filter = new CommonsRequestLoggingFilter();
        filter.setIncludeClientInfo(true);
        filter.setIncludeQueryString(true);
        return filter;
    }

    /**
     * Copied from https://karl.run/2018/05/07/kotlin-spring-boot-react/ - ensures that for a single page application,
     * any non-root route is routed back to "/".
     *
     * @return
     */
    @Bean
    public ConfigurableServletWebServerFactory webServerFactory() {
        TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
        // All errors should go to the index page
        Set<ErrorPage> errorPages = factory.getErrorPages();
        Stream.of(HttpStatus.values()).forEach((httpStatus -> {
            int statusValue = httpStatus.value();
            if (statusValue >= 400) {
                errorPages.add(new ErrorPage(HttpStatus.valueOf(statusValue), "/error"));
            }
        }));
        factory.getErrorPages().add(new ErrorPage(Throwable.class, "/error"));
        return factory;
    }
}
