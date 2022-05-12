package com.marklogic.spring.http;

import org.springframework.beans.factory.annotation.Value;

/**
 * Simple config class that can be a Bean in a Spring Configuration class and look for common MarkLogic connection
 * properties - mlHost and mlRestPort.
 * 
 * The scheme attribute is there for future SSL support.
 */
public class SimpleRestConfig implements RestConfig {

    @Value("${mlHost:localhost}")
    private String host;

    @Value("${mlRestPort:8000}")
    private Integer restPort;

    private String scheme = "http";
    
    @Value("${mlCacheDigest:true}")
    private Boolean digestCachingEnabled;

    public SimpleRestConfig() {

    }

    public SimpleRestConfig(String host, Integer restPort) {
        this.host = host;
        this.restPort = restPort;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public Integer getRestPort() {
        return restPort;
    }

    public void setRestPort(Integer restPort) {
        this.restPort = restPort;
    }

    public String getScheme() {
        return scheme;
    }

    public void setScheme(String scheme) {
        this.scheme = scheme;
    }

    public Boolean isDigestCachingEnabled() {
        return digestCachingEnabled;
    }

    public void setDigestCachingEnabled(Boolean cacheDigest) {
        this.digestCachingEnabled = cacheDigest;
    }

}
