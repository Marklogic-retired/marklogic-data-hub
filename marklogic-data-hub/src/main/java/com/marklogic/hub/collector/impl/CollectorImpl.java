/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.collector.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.SSLHostnameVerifier;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.collector.DiskQueue;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.rest.util.MgmtResponseErrorHandler;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.client.HttpClient;
import org.apache.http.conn.ssl.X509HostnameVerifier;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.client.HttpClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestTemplate;

import javax.naming.InvalidNameException;
import javax.naming.ldap.LdapName;
import javax.naming.ldap.Rdn;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLException;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocket;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.URLEncoder;
import java.security.cert.Certificate;
import java.security.cert.CertificateParsingException;
import java.security.cert.X509Certificate;
import java.util.*;

public class CollectorImpl implements Collector {
    private DatabaseClient client = null;
    private HubConfig hubConfig = null;


    private Flow flow = null;

    private static Logger logger = LoggerFactory.getLogger(CollectorImpl.class);

    public CollectorImpl() {}

    public CollectorImpl(Flow flow) {
        this.flow = flow;
    }

    @Override
    public void setHubConfig(HubConfig config) { this.hubConfig = config; }

    @Override
    public HubConfig getHubConfig() {
        return hubConfig;
    }

    @Override
    public void setClient(DatabaseClient client) {
        this.client = client;
    }

    @Override
    public DatabaseClient getClient() {
        return this.client;
    }


    @Override
    public DiskQueue<String> run(String flow, String step, Map<String, Object> options) {
        try {
            DiskQueue<String> results = new DiskQueue<>(5000);

            // Important design info:
            // The collector is invoked with a regular http client due to streaming limitations in OkHttp.
            // https://github.com/marklogic/marklogic-data-hub/issues/632
            // https://github.com/marklogic/marklogic-data-hub/issues/633
            //

            RestTemplate template = newRestTemplate(  ((HubConfigImpl) hubConfig).getMlUsername(), ( (HubConfigImpl) hubConfig).getMlPassword());
            String uriString = String.format(
                "%s://%s:%d%s?flow-name=%s&database=%s&step=%s",
                client.getSecurityContext().getSSLContext() != null ? "https" : "http",
                client.getHost(),
                client.getPort(),
                "/v1/internal/hubcollector5",

                URLEncoder.encode(flow, "UTF-8"),
                URLEncoder.encode(client.getDatabase(), "UTF-8"),
                URLEncoder.encode(step, "UTF-8")
            );
            if (options != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                uriString += "&options=" + URLEncoder.encode(objectMapper.writeValueAsString(options), "UTF-8");
            }

            URI uri = new URI(uriString);

            RequestCallback requestCallback = request -> request.getHeaders()
                .setAccept(Arrays.asList(MediaType.APPLICATION_OCTET_STREAM, MediaType.ALL));

            // Streams the response instead of loading it all in memory
            ResponseExtractor<Void> responseExtractor = response -> {
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(response.getBody(), "UTF-8"));
                String line;
                while((line = bufferedReader.readLine()) != null) {
                    results.add(line);
                }
                bufferedReader.close();
                return null;
            };

            template.execute(uri, HttpMethod.GET, requestCallback, responseExtractor);

            return results;
        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    private RestTemplate newRestTemplate(String username, String password) {
        DatabaseClientFactory.SecurityContext securityContext = client.getSecurityContext();

        BasicCredentialsProvider prov = new BasicCredentialsProvider();
        prov.setCredentials(
            new AuthScope(client.getHost(), client.getPort(), AuthScope.ANY_REALM),
            new UsernamePasswordCredentials(username, password));

        HttpClientBuilder httpClientBuilder = HttpClientBuilder.create().setDefaultCredentialsProvider(prov);

        if (securityContext != null) {
            SSLContext sslContext = securityContext.getSSLContext();
            if (sslContext != null) {
                httpClientBuilder.setSslcontext(sslContext);
            }

            SSLHostnameVerifier verifier = securityContext.getSSLHostnameVerifier();
            X509HostnameVerifier hostnameVerifier = null;
            if (verifier == SSLHostnameVerifier.ANY) {
                hostnameVerifier = new X509HostnameVerifier() {
                    @Override
                    public boolean verify(String paramString, SSLSession paramSSLSession) {
                        return true;
                    }

                    @Override
                    public void verify(String host, SSLSocket ssl) throws IOException {}

                    @Override
                    public void verify(String host, X509Certificate cert) throws SSLException {}

                    @Override
                    public void verify(String host, String[] cns, String[] subjectAlts) throws SSLException {}
                };

            } else if (verifier == SSLHostnameVerifier.COMMON) {
                hostnameVerifier = null;
            } else if (verifier == SSLHostnameVerifier.STRICT) {
                hostnameVerifier = null;
            } else if (verifier != null) {
                hostnameVerifier = new HostnameVerifierAdapter(verifier);
            }
            httpClientBuilder.setHostnameVerifier(hostnameVerifier);
        }

        HttpClient client = httpClientBuilder.build();

        RestTemplate rt = new RestTemplate(new HttpComponentsClientHttpRequestFactory(client));
        rt.setErrorHandler(new MgmtResponseErrorHandler());
        return rt;
    }

    static private class HostnameVerifierAdapter implements X509HostnameVerifier {
        private SSLHostnameVerifier verifier;

        protected HostnameVerifierAdapter(SSLHostnameVerifier verifier) {
          this.verifier = verifier;
        }
        
        public void verify(String hostname, X509Certificate cert) throws SSLException {
          ArrayList<String> cnArray = new ArrayList<>();
          try {
            LdapName ldapDN = new LdapName(cert.getSubjectX500Principal().getName());
            for(Rdn rdn: ldapDN.getRdns()) {
              Object value = rdn.getValue();
              if ( "CN".equalsIgnoreCase(rdn.getType()) && value instanceof String ) {
                cnArray.add((String) value);
              }
            }
            int type_dnsName = 2;
            int type_ipAddress = 7;
            ArrayList<String> subjectAltArray = new ArrayList<>();
            Collection<List<?>> alts = cert.getSubjectAlternativeNames();
            if ( alts != null ) {
              for ( List<?> alt : alts ) {
                if ( alt != null && alt.size() == 2 && alt.get(1) instanceof String ) {
                  Integer type = (Integer) alt.get(0);
                  if ( type == type_dnsName || type == type_ipAddress ) {
                    subjectAltArray.add((String) alt.get(1));
                  }
                }
              }
            }
            String[] cns = cnArray.toArray(new String[cnArray.size()]);
            String[] subjectAlts = subjectAltArray.toArray(new String[subjectAltArray.size()]);
            verifier.verify(hostname, cns, subjectAlts);
          } catch(CertificateParsingException e) {
            throw new MarkLogicIOException(e);
          } catch(InvalidNameException e) {
            throw new MarkLogicIOException(e);
          }
        }

        @Override
        public void verify(String hostname, SSLSocket ssl) throws IOException {
            Certificate[] certificates = ssl.getSession().getPeerCertificates();
            verify(hostname, (X509Certificate) certificates[0]);             
        }

        @Override
        public void verify(String hostname, String[] cns, String[] subjectAlts) throws SSLException {
            verifier.verify(hostname, cns, subjectAlts);            
        }

        @Override
        public boolean verify(String hostname, SSLSession session) {
            try {
              Certificate[] certificates = session.getPeerCertificates();
              verify(hostname, (X509Certificate) certificates[0]);
              return true;
              } 
            catch(SSLException e) {
              return false;
            }
        }
    }
}
