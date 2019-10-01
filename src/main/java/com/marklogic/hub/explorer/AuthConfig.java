/**
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer;

import com.marklogic.hub.explorer.auth.ConnectionAuthenticationFilter;
import com.marklogic.hub.explorer.auth.LoginFailureHandler;
import com.marklogic.hub.explorer.auth.MarkLogicAuthenticationManager;
import com.marklogic.hub.explorer.auth.RestAuthenticationEntryPoint;
import com.marklogic.hub.explorer.web.CurrentProjectController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Extends Spring Boot's default web security configuration class and hooks in MarkLogic-specific
 * classes from marklogic-spring-web. Feel free to customize as needed.
 */
@Configuration
@EnableWebSecurity
public class AuthConfig extends WebSecurityConfigurerAdapter {

  @Autowired
  private RestAuthenticationEntryPoint restAuthenticationEntryPoint;

  @Autowired
  private CurrentProjectController currentProjectController;

  @Lazy
  @Autowired
  private ConnectionAuthenticationFilter authFilter;

  @Autowired
  public MarkLogicAuthenticationManager markLogicAuthenticationManager;

  @Bean
  public ConnectionAuthenticationFilter getConnectionAuthenticationFilter() throws Exception {
    ConnectionAuthenticationFilter authFilter = new ConnectionAuthenticationFilter();
    authFilter.setAuthenticationManager(markLogicAuthenticationManager);
    authFilter.setAuthenticationSuccessHandler(currentProjectController);
    authFilter.setAuthenticationFailureHandler(new LoginFailureHandler());

    return authFilter;
  }

  /**
   * Sets MarkLogicAuthenticationProvider as the authentication manager, which overrides the
   * in-memory authentication manager that Spring Boot uses by default.
   */
  @Override
  protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    super.configure(auth);
    auth.parentAuthenticationManager(markLogicAuthenticationManager);
  }

  /**
   * Configures what requests require authentication and which ones are always permitted.
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
        .logoutUrl("/v2/logout")
        .logoutSuccessHandler(currentProjectController)
    ;

  }

  /**
   * Defines a set of URLs that are always permitted - these are based on the presumed contents of
   * the src/main/resources/static directory.
   */
  protected String[] getAlwaysPermittedPatterns() {
    return new String[]{
        "/",
        "/*.js",
        "/*.ttf",
        "/*.woff",
        "/*.svg",
        "/*.woff2",
        "/*.eot",
        "/*.css",
        "/index.html",
        "/explorer/login",
        "/404",
        "/assets/**",
        "/static/**",
        "/img/**",
        "/favicon.ico"
    };
  }
}
