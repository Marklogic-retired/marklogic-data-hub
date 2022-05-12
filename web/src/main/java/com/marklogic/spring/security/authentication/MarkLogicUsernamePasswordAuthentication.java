package com.marklogic.spring.security.authentication;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

/**
 * Doesn't erase credentials.. When upgrading Spring Boot in slush-marklogic-spring-boot from 1.3.5 to 1.4.3, some change
 * resulted in the call to AuthenticationManagerBuilder.eraseCredentials(false) to not work any longer. So this class is
 * used to prevent any erasing from occurring.
 */
public class MarkLogicUsernamePasswordAuthentication extends UsernamePasswordAuthenticationToken {

	public MarkLogicUsernamePasswordAuthentication(Object principal, Object credentials) {
		super(principal, credentials);
	}

	public MarkLogicUsernamePasswordAuthentication(Object principal, Object credentials, Collection<? extends GrantedAuthority> authorities) {
		super(principal, credentials, authorities);
	}

	@Override
	public void eraseCredentials() {
	}
}