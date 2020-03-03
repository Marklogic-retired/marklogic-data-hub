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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;

public class LoginHandler implements AuthenticationSuccessHandler {

    /**
     * Writes to the HTTP response all the data expected by the UI. This data is expected to have been collected
     * already during the authentication process and captured in the AuthenticationToken.
     *
     * @param request
     * @param httpResponse
     * @param authentication
     * @throws IOException
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse httpResponse, Authentication authentication) throws IOException {
        AuthenticationToken token = (AuthenticationToken) authentication;

        ObjectMapper mapper = new ObjectMapper();

        ObjectNode jsonResponse = mapper.createObjectNode();
        if (token.getRoles() != null) {
            jsonResponse.putArray("roles").addAll(token.getRoles());
        }
        if (token.getAuthorites() != null) {
            jsonResponse.putArray("authorities").addAll(token.getAuthorites());
        }
        jsonResponse.put("isInstalled", token.isDataHubInstalled());
        jsonResponse.put("hasManagePrivileges", token.hasManagePrivileges());
        jsonResponse.put("projectName", token.getProjectName());

        clearAuthenticationAttributes(request);

        httpResponse.setContentType("application/json");
        httpResponse.getOutputStream().write(mapper.writeValueAsBytes(jsonResponse));
    }

    private void clearAuthenticationAttributes(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            return;
        }
        session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
    }
}
