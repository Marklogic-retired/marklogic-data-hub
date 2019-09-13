/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.explorer.util;

import javax.annotation.PostConstruct;
import javax.net.ssl.SSLContext;
import javax.net.ssl.X509TrustManager;

import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;

import org.apache.commons.lang3.BooleanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

@Component
@PropertySource({"classpath:explorer-defaults.properties"})
public class ExplorerConfig {

  @Value("${mlHost}")
  private String hostname;
  @Value("${mlFinalDbName:#{null}}")
  private String finalDbName;
  @Value("${mlFinalPort}")
  private Integer finalPort;
  @Value("${mlFinalAuth}")
  private String finalAuthMethod;
  @Value("${mlFinalScheme}")
  private String finalScheme;

  @Value("${mlFinalSimpleSsl}")
  private Boolean finalSimpleSsl;
  private SSLContext finalSslContext;
  private DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier;
  private X509TrustManager finalTrustManager;

  @Value("${mlFinalCertFile:#{null}}")
  private String finalCertFile;
  @Value("${mlFinalCertPassword:#{null}}")
  private String finalCertPassword;
  @Value("${mlFinalExternalName:#{null}}")
  private String finalExternalName;

  @Value("${mlIsHostLoadBalancer}")
  private Boolean isHostLoadBalancer;

  public String getHostname() {
    return hostname;
  }

  public void setHostname(String hostname) {
    this.hostname = hostname;
  }

  public String getFinalDbName() {
    return finalDbName;
  }

  public void setFinalDbName(String finalDbName) {
    this.finalDbName = finalDbName;
  }

  public Integer getFinalPort() {
    return finalPort;
  }

  public void setFinalPort(Integer finalPort) {
    this.finalPort = finalPort;
  }

  public String getFinalAuthMethod() {
    return finalAuthMethod;
  }

  public void setFinalAuthMethod(String finalAuthMethod) {
    this.finalAuthMethod = finalAuthMethod;
  }

  public String getFinalScheme() {
    return finalScheme;
  }

  public void setFinalScheme(String finalScheme) {
    this.finalScheme = finalScheme;
  }

  public Boolean getFinalSimpleSsl() {
    return finalSimpleSsl;
  }

  public void setFinalSimpleSsl(Boolean finalSimpleSsl) {
    this.finalSimpleSsl = finalSimpleSsl;
  }

  public SSLContext getFinalSslContext() {
    return finalSslContext;
  }

  public void setFinalSslContext(SSLContext finalSslContext) {
    this.finalSslContext = finalSslContext;
  }

  public DatabaseClientFactory.SSLHostnameVerifier getFinalSslHostnameVerifier() {
    return finalSslHostnameVerifier;
  }

  public void setFinalSslHostnameVerifier(
      DatabaseClientFactory.SSLHostnameVerifier finalSslHostnameVerifier) {
    this.finalSslHostnameVerifier = finalSslHostnameVerifier;
  }

  public String getFinalCertFile() {
    return finalCertFile;
  }

  public void setFinalCertFile(String finalCertFile) {
    this.finalCertFile = finalCertFile;
  }

  public String getFinalCertPassword() {
    return finalCertPassword;
  }

  public void setFinalCertPassword(String finalCertPassword) {
    this.finalCertPassword = finalCertPassword;
  }

  public String getFinalExternalName() {
    return finalExternalName;
  }

  public void setFinalExternalName(String finalExternalName) {
    this.finalExternalName = finalExternalName;
  }

  public X509TrustManager getFinalTrustManager() {
    return finalTrustManager;
  }

  public void setFinalTrustManager(X509TrustManager finalTrustManager) {
    this.finalTrustManager = finalTrustManager;
  }

  public Boolean getHostLoadBalancer() {
    return isHostLoadBalancer;
  }

  public void setHostLoadBalancer(Boolean hostLoadBalancer) {
    isHostLoadBalancer = hostLoadBalancer;
  }

  @PostConstruct
  private void simpleSslSetup() {
    if (BooleanUtils.isTrue(finalSimpleSsl)) {
      finalSslContext = SimpleX509TrustManager.newSSLContext();
      finalSslHostnameVerifier = DatabaseClientFactory.SSLHostnameVerifier.ANY;
      finalTrustManager = new SimpleX509TrustManager();
    }
  }
}
