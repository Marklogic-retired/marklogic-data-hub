package com.marklogic.spring.http;

import org.apache.http.client.CredentialsProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestOperations;

import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URLDecoder;

/**
 * Simple class that wraps a RestTemplate and simplifies providing credentials to that RestTemplate and building the URI
 * for a request. A client of this will typically call getRestOperations() and then buildUri, taking the result and
 * passing it to a method in the RestOperations instance.
 */
public class RestClient {

	protected Logger logger = LoggerFactory.getLogger(getClass());

	private RestConfig restConfig;
	private RestOperations restOperations;

	private boolean decodeQuerystring = true;
	private String encoding = "UTF-8";

	/**
	 * A DefaultRestOperationsFactory is used to construct a RestOperations based on the given RestConfig and
	 * CredentialsProvider. To customize this behavior, just use the other constructor that allows for a RestOperations
	 * to be passed in directly.
	 *
	 * @param restConfig
	 * @param credentialsProvider
	 */
	public RestClient(RestConfig restConfig, CredentialsProvider credentialsProvider) {
		this.restConfig = restConfig;
		this.restOperations = new DefaultRestOperationsFactory().newRestOperations(restConfig, credentialsProvider);
	}

	public RestClient(RestConfig restConfig, RestOperations restOperations) {
		this.restConfig = restConfig;
		this.restOperations = restOperations;
	}

	public URI buildUri(String path, String queryString) {
		try {
			/**
			 * Gotta decode this, the URI constructor will then encode it. The QS will often have encoded text on it
			 * already, such as for a structured query for a /v1/search request. The text is then decoded here, and then
			 * encoded by the URI class, which ensures that we don't double-encode the QS.
			 */
			if (isDecodeQuerystring()) {
				queryString = decode(queryString);
			}
			return new URI(restConfig.getScheme(), null, restConfig.getHost(), restConfig.getRestPort(), path,
				queryString, null);
		} catch (Exception ex) {
			throw new RuntimeException("Unable to build URI, cause: " + ex.getMessage(), ex);
		}
	}

	protected String decode(String queryString) {
		try {
			return queryString != null ? URLDecoder.decode(queryString, "UTF-8") : null;
		} catch (UnsupportedEncodingException ex) {
			throw new RuntimeException("Unable to decode queryString, cause: " + ex.getMessage(), ex);
		}
	}

	public RestOperations getRestOperations() {
		return restOperations;
	}

	public boolean isDecodeQuerystring() {
		return decodeQuerystring;
	}

	public void setDecodeQuerystring(boolean decodeQuerystring) {
		this.decodeQuerystring = decodeQuerystring;
	}

	public String getEncoding() {
		return encoding;
	}

	public void setEncoding(String encoding) {
		this.encoding = encoding;
	}

	public RestConfig getRestConfig() {
		return restConfig;
	}
}
