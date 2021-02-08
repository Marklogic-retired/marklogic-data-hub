/*
 * Copyright 2012-2021 MarkLogic Corporation
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
package com.marklogic.hub.central.cloud.azure;

import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.security.keyvault.secrets.SecretClient;
import com.azure.security.keyvault.secrets.SecretClientBuilder;
import com.marklogic.hub.central.cloud.ParameterSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
@Profile("azure")
public class AzureKeyVaultSecret implements ParameterSource {
    private static final Logger logger = LoggerFactory.getLogger(AzureKeyVaultSecret.class);

    private final Map<String, String> parameterValueMap;

    @Value("${azure.keyvault.uri:}")
    private String keyVaultUri;

    AzureKeyVaultSecret() {
        parameterValueMap = new HashMap<>();
    }

    @Override
    public String getParameter(String key) {
        if (parameterValueMap.containsKey(key)) {
            return parameterValueMap.get(key);
        }

        String value = null;
        try {
            logger.info("Retrieving value for key: " + key);
            SecretClient secretClient = new SecretClientBuilder()
                    .vaultUrl(keyVaultUri)
                    .credential(new DefaultAzureCredentialBuilder().build())
                    .buildClient();

            value = secretClient.getSecret(key).getValue();
            logger.info("Retrieved value for key: " + key);
        }
        catch (Exception e) {
            logger.error("Error in retrieving value for key: " + key + "; cause: " + e.getMessage(), e);
        }

        // since we dont want to call the cloud service again, we will insert `null` if there's an error in retrieving the value for the key
        parameterValueMap.put(key, value);

        return value;
    }
}
