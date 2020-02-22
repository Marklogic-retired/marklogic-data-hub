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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.dataservices.RolesService;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.apache.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class LoginLogoutHandler implements AuthenticationSuccessHandler, LogoutSuccessHandler {

    ObjectMapper mapper = new ObjectMapper();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken)authentication;
        ObjectNode resp = mapper.createObjectNode();
        boolean isInstalled = authenticationToken.stagingIsAccessible();
        final boolean[] managePrivilege = new boolean[3];
        if (authenticationToken.stagingIsAccessible()) {
            try {
                RolesService rolesService = RolesService.on(authenticationToken.getHubConfigSession().newStagingClient());
                resp.putArray("roles").addAll((ArrayNode) rolesService.getRoles());
                if (authenticationToken.hasManagePrivileges()) {
                    ArrayNode rolesNodes = (ArrayNode) resp.get("roles");
                    rolesNodes.forEach(e -> {
                        if ("data-hub-environment-manager".equals(e.asText())) {
                            managePrivilege[0] = true;
                            return;
                        } else if ("manager-admin".equals(e.asText())) {
                            managePrivilege[1] = true;
                        } else if ("security".equals(e.asText())) {
                            managePrivilege[2] = true;
                        }
                    });
                }
            } catch (FailedRequestException e) {
                // If Roles Data Service isn't installed, the latest Data Hub isn't installed
                if (e.getServerStatusCode() == HttpStatus.SC_NOT_FOUND) {
                    isInstalled = false;
                }
            }
        }

        resp.put("isInstalled", isInstalled);
        resp.put("hasManagePrivileges", !authenticationToken.hasManagePrivileges() ? false :
            (managePrivilege[0] || managePrivilege[1] && managePrivilege[2]) ? true : false);
        resp.put("projectName", (String) request.getSession().getAttribute("projectName"));
        clearAuthenticationAttributes(request);
        response.setContentType("application/json");
        response.getOutputStream().write(mapper.writeValueAsBytes(resp));
    }

    private void clearAuthenticationAttributes(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null) {
            return;
        }

        session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
    }

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        request.getSession().invalidate();
    }
}
