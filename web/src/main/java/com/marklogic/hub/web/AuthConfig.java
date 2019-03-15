/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web;

import com.marklogic.hub.web.auth.ConnectionAuthenticationFilter;
import com.marklogic.hub.web.auth.LoginFailureHandler;
import com.marklogic.hub.web.auth.MarkLogicAuthenticationManager;
import com.marklogic.hub.web.auth.RestAuthenticationEntryPoint;
import com.marklogic.hub.web.web.CurrentProjectController;
import com.marklogic.spring.http.RestConfig;
import com.marklogic.spring.http.SimpleRestConfig;
import com.marklogic.spring.security.context.SpringSecurityCredentialsProvider;
import org.apache.http.client.CredentialsProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Extends Spring Boot's default web security configuration class and hooks in MarkLogic-specific classes from
 * marklogic-spring-web. Feel free to customize as needed.
 */
@Configuration
@EnableWebSecurity
public class AuthConfig extends WebSecurityConfigurerAdapter {
    /**
     * @return a config class with ML connection properties
     */
    @Bean
    public RestConfig restConfig() {
        return new SimpleRestConfig();
    }

    @Bean
    public CredentialsProvider credentialsProvider() {
        return new SpringSecurityCredentialsProvider();
    }

    @Autowired
    private RestAuthenticationEntryPoint restAuthenticationEntryPoint;

    @Autowired
    private CurrentProjectController currentProjectController;

    @Lazy
    @Autowired
    private ConnectionAuthenticationFilter authFilter;

    @Override
    public void configure(WebSecurity web) {
        web.ignoring().antMatchers("/h2-console/**");
    }

    @Autowired
    public MarkLogicAuthenticationManager markLogicAuthenticationManager;

    @Bean
    public ConnectionAuthenticationFilter getConnectionAuthenticationFilter() throws Exception{
        ConnectionAuthenticationFilter authFilter = new ConnectionAuthenticationFilter();
        authFilter.setAuthenticationManager(markLogicAuthenticationManager);
        authFilter.setAuthenticationSuccessHandler(currentProjectController);
        authFilter.setAuthenticationFailureHandler(new LoginFailureHandler());

        return authFilter;
    }

    /**
     * Sets MarkLogicAuthenticationProvider as the authentication manager, which overrides the in-memory authentication
     * manager that Spring Boot uses by default. We also have to set eraseCredentials to false so that the password is
     * kept in the Authentication object, which allows HttpProxy to use it when authenticating against MarkLogic.
     */
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        super.configure(auth);
        auth.parentAuthenticationManager(markLogicAuthenticationManager);
        auth.eraseCredentials(false);
    }

    /**
     * Configures what requests require authentication and which ones are always permitted. Uses CorsRequestMatcher to
     * allow for certain requests - e.g. put/post/delete requests - to be proxied successfully back to MarkLogic.
     *
     * This uses a form login by default, as for many MarkLogic apps (particularly demos), it's convenient to be able to
     * easily logout and login as a different user to show off security features. Spring Security has a very plain form
     * login page - you can customize this, just google for examples.
     */
    @Override
    protected void configure(HttpSecurity http) throws Exception {

        http
            .headers().frameOptions().disable()
            .and()
            .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class)
            .csrf().disable()
            .exceptionHandling()
            .authenticationEntryPoint(restAuthenticationEntryPoint)
            .and()
            .authorizeRequests()
            .antMatchers(getAlwaysPermittedPatterns()).permitAll().anyRequest().authenticated()
            .and()
            .logout()
            .logoutUrl("/api/logout")
            .logoutSuccessHandler(currentProjectController)
        ;

    }

    /**
     * Defines a set of URLs that are always permitted - these are based on the presumed contents of the
     * src/main/resources/static directory.
     *
     * @return
     */
    protected String[] getAlwaysPermittedPatterns() {
        return new String[] {
            "/websocket/**",
            "/api/projects/**",
            "/api/utils/**",
            "/",
            "/*.js",
            "/*.ttf",
            "/*.woff",
            "/*.svg",
            "/*.woff2",
            "/*.eot",
            "/*.css",
            "/index.html",
            "/login",
            "/home",
            "/settings",
            "/jobs",
            "/traces/**",
            "/404",
            "/assets/**",
            "/static/**",
            "/shutdown",
            "/img/**",
            "/favicon.ico"
        };
    }
}
