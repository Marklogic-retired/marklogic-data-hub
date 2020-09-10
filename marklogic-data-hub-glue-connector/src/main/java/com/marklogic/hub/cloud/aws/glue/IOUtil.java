/*
 * Copyright 2019 MarkLogic Corporation
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
package com.marklogic.hub.cloud.aws.glue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.document.TextDocumentManager;

import javax.net.ssl.*;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.security.cert.X509Certificate;

public class IOUtil {

    public static DatabaseClient db ;
    public static DatabaseClient modDb;
    public static TextDocumentManager modMgr;

    public final static ObjectMapper mapper = new ObjectMapper();

    public IOUtil(String hostip, int port, String username, String password, String moduleDatabase) {
        try {

            X509TrustManager trustManager = new X509TrustManager() {
                @Override
                public void checkClientTrusted(X509Certificate[] chain, String authType) {
                }
                @Override
                public void checkServerTrusted(X509Certificate[] chain, String authType) {
                }
                @Override
                public X509Certificate[] getAcceptedIssuers() {
                    return new X509Certificate[0];
                }
            };
            SSLContext sslContext = null;
            try{
                sslContext= SSLContext.getInstance("TLSv1.2");
                sslContext.init(null, new TrustManager[]{trustManager}, null);
            }
            catch (Exception e){
                e.printStackTrace();
            }
            db = DatabaseClientFactory.newClient(hostip, port,  new DatabaseClientFactory.BasicAuthContext(username, password).withSSLHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier.ANY).withSSLContext(sslContext, trustManager),
                DatabaseClient.ConnectionType.GATEWAY);
            modDb = DatabaseClientFactory.newClient(hostip, port, moduleDatabase, new DatabaseClientFactory.BasicAuthContext(username, password).withSSLHostnameVerifier(DatabaseClientFactory.SSLHostnameVerifier.ANY).withSSLContext(sslContext, trustManager),
                DatabaseClient.ConnectionType.GATEWAY);
            modMgr = modDb.newTextDocumentManager();
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Exception occurred while creating DatabaseClient "+ex.getMessage());
        }
    }

    public static InputStream asInputStream(String value) {
        return new ByteArrayInputStream(value.getBytes());
    }

}

