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
package com.marklogic.hub.central.auth;

import com.marklogic.hub.central.HttpSessionHubClientProvider;
import com.marklogic.hub.central.HubCentral;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.logout.LogoutFilter;

import javax.servlet.DispatcherType;
import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.nio.charset.Charset;

/**
 * Configures Spring Security for the central web application.
 */
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(securedEnabled = true)
public class WebSecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired
    HubCentral hubCentral;

    @Autowired
    HttpSessionHubClientProvider hubClientProvider;

    @Autowired
    Environment environment;

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .headers().frameOptions().disable()
            .and()
            // Adds the custom filter for authenticating a user. Check the startup logging to see where this ends up in
            // the Spring Security filter chain.
            .addFilterAfter(new AuthenticationFilter(hubCentral, hubClientProvider), LogoutFilter.class)
            .csrf().disable()
            // Need to setStatus, sendError causes issues. see https://stackoverflow.com/a/34911131
            .exceptionHandling().authenticationEntryPoint(((request, response, authException) -> {
                if (request.getRequestURI().startsWith("/api/") || request.getRequestURI().startsWith("/websocket/")) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                } else {
                    response.sendRedirect("/?from=" + URLEncoder.encode(request.getRequestURI(), "UTF-8"));
                }
            }))
            .and()
            // Define requests that are always permitted, regardless of whether the user is authenticated or not
            .authorizeRequests()
                // Needed for springfox to work - see https://github.com/springfox/springfox/issues/1996#issuecomment-335155187
                .antMatchers("/swagger-resources/**", "/swagger-ui.html", "/v2/api-docs", "/webjars/**").permitAll()
                // Non-springfox patterns to permit
                .antMatchers(getAlwaysPermittedPatterns()).permitAll();
        // needed for WebSocket test
        if (environment.getProperty("hub.websocket.securityDisabled","false").equals("true")) {
            http.authorizeRequests().antMatchers("/websocket/**").permitAll();
        }
        http.authorizeRequests().anyRequest().authenticated()
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
