package com.marklogic.spring.security.web.util.matcher;

import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * RequestMatcher implementation that is useful for disabling CORS for common requests that are proxied to MarkLogic.
 * This is based on the example found at
 * http://blogs.sourceallies.com/2014/04/customizing-csrf-protection-in-spring-security/.
 * 
 * To use this with Spring Boot, you can subclass WebSecurityConfigurerAdapter and then override the
 * configure(HttpSecurity http) method. Within that method, call http.csrf().requireCsrfProtectionMatcher(new
 * CorsRequestMatcher()).
 */
public class CorsRequestMatcher implements RequestMatcher {

    private Pattern allowedMethods = Pattern.compile("^(GET|HEAD|TRACE|OPTIONS)$");
    private RegexRequestMatcher apiMatcher = new RegexRequestMatcher("/v[1-9]*/.*", null);

    @Override
    public boolean matches(HttpServletRequest request) {
        if (allowedMethods.matcher(request.getMethod()).matches()) {
            return false;
        }
        if (apiMatcher.matches(request)) {
            return false;
        }
        return true;
    }

}