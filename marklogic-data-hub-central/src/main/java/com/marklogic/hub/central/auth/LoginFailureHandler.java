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

import com.google.gson.Gson;
import com.marklogic.hub.central.exceptions.BadRequestException;
import com.marklogic.hub.central.exceptions.ForbiddenException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

public class LoginFailureHandler implements AuthenticationFailureHandler {

    public LoginFailureHandler() {
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                        AuthenticationException exception) throws IOException, ServletException {

        Map<String, String> output = new LinkedHashMap<>();
        output.put("message", exception.getMessage());
        String json = new Gson().toJson(output);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        if (exception instanceof BadRequestException) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        } else if (exception instanceof ForbiddenException) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }
        response.getWriter().write(json);
    }
}
