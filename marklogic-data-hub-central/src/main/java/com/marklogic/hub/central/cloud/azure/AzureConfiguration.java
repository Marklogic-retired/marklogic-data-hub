/*
 * Copyright 2012-2020 MarkLogic Corporation
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
import com.azure.storage.blob.BlobClientBuilder;
import com.marklogic.hub.central.web.SslUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.io.InputStream;

@Configuration
@Profile("azure")
public class AzureConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(AzureConfiguration.class);

    @Value("${key-store-password}")
    private String keyStorePassword;

    @Value("${azure.storage.endpoint}")
    private String endpoint;

    @Value("${azure.storage.containerName}")
    private String containerName;

    @Value("${azure.storage.blobName}")
    private String blobName;

    @Bean
    public ServerProperties serverProperties() {
        return SslUtil.buildServerProperties(keyStorePassword);
    }

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatSslStoreCustomizer() {
        return SslUtil.configureSslStoreProvider(keyStorePassword, retrieveKeyStoreFile());
    }

    private InputStream retrieveKeyStoreFile() {
        logger.info("Retrieving keystore file");
        InputStream keyStoreStream = new BlobClientBuilder()
                .endpoint(endpoint)
                .containerName(containerName)
                .blobName(blobName)
                .credential(new DefaultAzureCredentialBuilder().build())
                .buildClient()
                .openInputStream();
        logger.info("Retrieved keystore file");

        return keyStoreStream;
    }
}
