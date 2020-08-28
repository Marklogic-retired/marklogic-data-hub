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
package com.marklogic.hub.central.cloud.aws;

import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.simplesystemsmanagement.AWSSimpleSystemsManagementClientBuilder;
import com.amazonaws.services.simplesystemsmanagement.model.GetParameterRequest;
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
@Profile("aws")
public class AWSConfiguration {

    private static final Logger logger = LoggerFactory.getLogger(AWSConfiguration.class);

    @Value("${aws.s3.bucketName}")
    private String bucketName;

    @Value("${aws.s3.keyName}")
    private String keyName;

    private String keyStorePassword;

    @Bean
    public ServerProperties serverProperties() {
        return SslUtil.buildServerProperties(retrieveKeyStorePassword());
    }

    @Bean
    public WebServerFactoryCustomizer<TomcatServletWebServerFactory> tomcatSslStoreCustomizer() {
        return SslUtil.configureSslStoreProvider(retrieveKeyStorePassword(), retrieveKeyStoreFile());
    }

    private String retrieveKeyStorePassword() {
        if (keyStorePassword != null) {
            return keyStorePassword;
        }

        logger.info("Retrieving keystore password");
        GetParameterRequest parameterRequest = new GetParameterRequest()
                .withName("key-store-password")
                .withWithDecryption(true);

        keyStorePassword = AWSSimpleSystemsManagementClientBuilder
                .defaultClient()
                .getParameter(parameterRequest)
                .getParameter()
                .getValue();
        logger.info("Retrieved keystore password");

        return keyStorePassword;
    }

    private InputStream retrieveKeyStoreFile() {
        logger.info("Retrieving keystore file");
        InputStream keyStoreStream = AmazonS3ClientBuilder
                .defaultClient()
                .getObject(bucketName, keyName)
                .getObjectContent();
        logger.info("Retrieved keystore file");

        return keyStoreStream;
    }
}
