/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.quickstart;

import com.marklogic.client.helper.LoggingObject;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.springframework.security.core.context.SecurityContextHolder;

public class EnvironmentAware extends LoggingObject {

    private EnvironmentConfig _envConfig = null;

    protected EnvironmentConfig envConfig() {
        if (_envConfig == null) {
            ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            if (authenticationToken != null) {
                _envConfig = authenticationToken.getEnvironmentConfig();
            }
        }
        return _envConfig;
    }


}
