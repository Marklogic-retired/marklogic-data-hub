/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.oneui.auth;

import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.logout.LogoutFilter;

import javax.servlet.http.HttpServletResponse;

/**
 * Configures Spring Security for the oneui web application.
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true)
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired
    private EnvironmentService environmentService;

    @Autowired
    private HubConfigSession hubConfig;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .headers().frameOptions().disable()
            .and()
            // Adds the custom filter for authenticating a user. Check the startup logging to see where this ends up in
            // the Spring Security filter chain.
            .addFilterAfter(new AuthenticationFilter(environmentService, hubConfig), LogoutFilter.class)
            .csrf().disable()
            // Need to setStatus, sendError causes issues. see https://stackoverflow.com/a/34911131
            .exceptionHandling().authenticationEntryPoint(((request, response, authException) -> response.setStatus(HttpServletResponse.SC_UNAUTHORIZED)))
            .and()
            // Define requests that are always permitted, regardless of whether the user is authenticated or not
            .authorizeRequests().antMatchers(getAlwaysPermittedPatterns()).permitAll().anyRequest().authenticated()
            .and()
            .logout().logoutUrl("/api/logout").logoutSuccessHandler(((request, response, authentication) -> request.getSession().invalidate()));
    }

    /**
     * Defines a set of URLs that are always permitted - these are based on the presumed contents of the
     * src/main/resources/static directory.
     *
     * @return
     */
    protected String[] getAlwaysPermittedPatterns() {
        return new String[]{
            "/api/environment/initialized",
            "/websocket/**",
            "/actuator/**",
            "/",
            "/*.js",
            "/*.ttf",
            "/*.woff",
            "/*.svg",
            "/*.woff2",
            "/*.eot",
            "/*.css",
            "/*.png",
            "/*.jpg",
            "/*.jpeg",
            "/index.html",
            "/login",
            "/error",
            "/assets/**",
            "/static/**",
            "/img/**",
            "/favicon.ico"
        };
    }
}
