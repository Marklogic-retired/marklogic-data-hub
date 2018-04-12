/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.quickstart;

import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;

public class EnvironmentAware {

    private EnvironmentConfig _envConfig = null;

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public EnvironmentConfig envConfig() {
        ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        if (authenticationToken != null) {
            _envConfig = authenticationToken.getEnvironmentConfig();
        }
        return _envConfig;
    }


}
