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
package com.marklogic.hub.central.auth;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.SpringSecurityCoreVersion;

import java.util.Collection;

/**
 * Custom token for Spring Security that captures all of the state needed after authenticating a user.
 */
public class AuthenticationToken extends AbstractAuthenticationToken {

    private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

    private final String username;
    private String password;
    private boolean isDataHubInstalled;

    public AuthenticationToken(String username, String password, Collection<GrantedAuthority> authorities, boolean isDataHubInstalled) {
        super(authorities);
        super.setAuthenticated(true);
        this.username = username;
        this.password = password;
        this.isDataHubInstalled = isDataHubInstalled;
    }

    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        if (isAuthenticated) {
            throw new IllegalArgumentException("Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead");
        }
        super.setAuthenticated(false);
    }

    @Override
    public void eraseCredentials() {
        super.eraseCredentials();
        password = null;
    }

    public Object getCredentials() {
        return this.password;
    }

    public Object getPrincipal() {
        return this.username;
    }

    public boolean isDataHubInstalled() {
        return this.isDataHubInstalled;
    }

}
