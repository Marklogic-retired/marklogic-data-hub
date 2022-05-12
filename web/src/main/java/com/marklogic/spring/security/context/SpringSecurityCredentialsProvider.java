package com.marklogic.spring.security.context;

import org.apache.http.auth.AuthScope;
import org.apache.http.auth.Credentials;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.CredentialsProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.Assert;

/**
 * Implementation of HTTPClient's CredentialsProvider that depends on Spring Security's
 * UsernamePasswordAuthenticationToken, as well as the credentials of that token not being erased by Spring Security.
 */
public class SpringSecurityCredentialsProvider implements CredentialsProvider {

    @Override
    public Credentials getCredentials(AuthScope authscope) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken token = (UsernamePasswordAuthenticationToken) auth;
            Assert.notNull(token.getCredentials(),
                    "The credentials were erased on this token; please ensure that Spring Security is not configured to erase authentication credentials");
            return new UsernamePasswordCredentials(token.getPrincipal().toString(), token.getCredentials().toString());
        }
        throw new IllegalStateException("The Spring Security Authentication must be an instance of "
                + UsernamePasswordAuthenticationToken.class.getName());
    }

    @Override
    public void setCredentials(AuthScope authscope, Credentials credentials) {
    }

    @Override
    public void clear() {
    }

}
