package com.marklogic.spring.http;

public interface RestConfig {

    public String getHost();

    public Integer getRestPort();

    public String getScheme();

    public Boolean isDigestCachingEnabled();
}
