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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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

        List<TextNode> authorities = new ArrayList<>();
        token.getAuthorities().forEach(auth -> {
            String authority = auth.getAuthority();
            if (authority.length() > 5) { //trim prefix "ROLE_"
                authorities.add(new TextNode(auth.getAuthority().substring(5, authority.length())));
            }
        });
        jsonResponse.putArray("authorities").addAll(authorities);

        // TODO These two things should go away
        jsonResponse.put("isInstalled", true);
        jsonResponse.put("hasManagePrivileges", false);

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
