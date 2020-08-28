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
package com.marklogic.hub.central.web;

import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.Ssl;
import org.springframework.boot.web.server.SslStoreProvider;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;

import java.io.InputStream;
import java.security.KeyStore;

public class SslUtil {

    public static String KEY_STORE_TYPE = "PKCS12";

    public static ServerProperties buildServerProperties(String keyStorePassword) {
        final ServerProperties serverProperties = new ServerProperties();
        final Ssl ssl = new Ssl();
        System.setProperty("server.ssl.key-store-password", keyStorePassword);
        ssl.setKeyPassword(keyStorePassword);
        serverProperties.setSsl(ssl);
        return serverProperties;
    }

    public static WebServerFactoryCustomizer<TomcatServletWebServerFactory> configureSslStoreProvider(String keyStorePassword, InputStream keyStoreFile) {
        KeyStore keyStore;

        try (InputStream is = keyStoreFile) {
            keyStore = KeyStore.getInstance(KEY_STORE_TYPE);
            keyStore.load(is, keyStorePassword.toCharArray());
        }
        catch (Exception e) {
            throw new RuntimeException("Cannot load keystore file; cause: " + e.getMessage(), e);
        }

        return tomcat -> tomcat.setSslStoreProvider(new SslStoreProvider() {
            @Override
            public KeyStore getKeyStore() {
                return keyStore;
            }

            @Override
            public KeyStore getTrustStore() {
                return null;
            }
        });
    }
}
