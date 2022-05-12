package com.marklogic.spring.http;

import org.apache.http.client.CredentialsProvider;
import org.springframework.web.client.RestOperations;

public interface RestOperationsFactory {

	RestOperations newRestOperations(RestConfig restConfig, CredentialsProvider credentialsProvider);

}
