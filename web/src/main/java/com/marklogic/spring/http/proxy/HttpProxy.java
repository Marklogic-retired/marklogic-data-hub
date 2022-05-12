package com.marklogic.spring.http.proxy;

import com.marklogic.spring.http.RestClient;
import com.marklogic.spring.http.RestConfig;
import org.apache.http.client.CredentialsProvider;
import org.springframework.http.HttpMethod;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.ResponseExtractor;
import org.springframework.web.client.RestOperations;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.net.URI;

/**
 * Simple proxy class that uses Spring's RestOperations to proxy servlet requests to MarkLogic.
 */
public class HttpProxy extends RestClient {

	public HttpProxy(RestConfig restConfig, CredentialsProvider provider) {
		super(restConfig, provider);
	}

	public HttpProxy(RestConfig restConfig, RestOperations restOperations) {
		super(restConfig, restOperations);
	}

	/**
	 * Proxy a request without copying any headers.
	 *
	 * @param httpRequest
	 * @param httpResponse
	 */
	public void proxy(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
		proxy(httpRequest.getServletPath(), httpRequest, httpResponse);
	}

	/**
	 * Proxy a request and copy the given headers on both the request and the response.
	 *
	 * @param httpRequest
	 * @param httpResponse
	 * @param headerNamesToCopy
	 */
	public void proxy(HttpServletRequest httpRequest, HttpServletResponse httpResponse, String... headerNamesToCopy) {
		proxy(httpRequest.getServletPath(), httpRequest, httpResponse,
			new DefaultRequestCallback(httpRequest, headerNamesToCopy),
			new DefaultResponseExtractor(httpResponse, headerNamesToCopy));
	}

	/**
	 * Proxy a request, using the given path instead of the servlet path in the HttpServletRequest.
	 *
	 * @param path
	 * @param httpRequest
	 * @param httpResponse
	 * @param headerNamesToCopy
	 */
	public void proxy(String path, HttpServletRequest httpRequest, HttpServletResponse httpResponse,
	                  String... headerNamesToCopy) {
		proxy(path, httpRequest, httpResponse, new DefaultRequestCallback(httpRequest, headerNamesToCopy),
			new DefaultResponseExtractor(httpResponse, headerNamesToCopy));
	}

	/**
	 * Specify your own request callback and response extractor. This gives you the most flexibility, but does the least
	 * for you.
	 *
	 * @param path
	 * @param httpRequest
	 * @param httpResponse
	 * @param requestCallback
	 * @param responseExtractor
	 * @return
	 */
	public <T> T proxy(String path, HttpServletRequest httpRequest, HttpServletResponse httpResponse,
	                   RequestCallback requestCallback, ResponseExtractor<T> responseExtractor) {
		URI uri = buildUri(path, httpRequest.getQueryString());
		if (logger.isDebugEnabled()) {
			logger.debug(String.format("Proxying to URI: %s", uri));
		}
		HttpMethod method = determineMethod(httpRequest);
		return getRestOperations().execute(uri, method, requestCallback, responseExtractor);
	}

	protected HttpMethod determineMethod(HttpServletRequest request) {
		return HttpMethod.valueOf(request.getMethod());
	}

}
