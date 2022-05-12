package com.marklogic.spring.http;

import org.apache.http.Header;
import org.apache.http.HeaderElement;
import org.apache.http.HttpHost;
import org.apache.http.HttpResponse;
import org.apache.http.client.AuthCache;
import org.apache.http.client.CredentialsProvider;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.client.protocol.HttpClientContext;
import org.apache.http.impl.auth.DigestScheme;
import org.apache.http.impl.client.BasicAuthCache;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.protocol.BasicHttpContext;
import org.apache.http.protocol.HttpContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestOperations;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * Default implementation that supports digest caching. If that's enabled in the given RestConfig object, then this
 * class will make a HEAD request to MarkLogic so it can analyze the authentication header in the response to
 * determine if digest authentication is being used. If so, then this class constructs a RestTemplate that supports
 * digest caching.
 */
public class DefaultRestOperationsFactory implements RestOperationsFactory {

	protected Logger logger = LoggerFactory.getLogger(getClass());

	@Override
	public RestOperations newRestOperations(RestConfig restConfig, CredentialsProvider credentialsProvider) {
		if (!restConfig.isDigestCachingEnabled()) {
			return newRestOperations(credentialsProvider);
		}

		HttpResponse response = getHeadResponse(restConfig);
		AuthenticationHeader header = extractAuthenticationHeader(response);

		if (!"digest".equalsIgnoreCase(header.getValue())) {
			return newRestOperations(credentialsProvider);
		}

		return prepareDigestTemplate(restConfig, credentialsProvider, header.getRealm());
	}

	protected RestOperations newRestOperations(CredentialsProvider credentialsProvider) {
		return new RestTemplate(new HttpComponentsClientHttpRequestFactory(newHttpClient(credentialsProvider)));
	}

	protected HttpClient newHttpClient(CredentialsProvider provider) {
		return HttpClientBuilder.create().setDefaultCredentialsProvider(provider).useSystemProperties().build();
	}

	/**
	 * Sends a HEAD request so that the headers in the response can be analyzed.
	 *
	 * @param config
	 * @return
	 */
	protected HttpResponse getHeadResponse(RestConfig config) {
		URI uri;
		try {
			uri = new URI(config.getScheme(), null, config.getHost(), config.getRestPort(), "/",
				"", null);
		} catch (URISyntaxException ex) {
			throw new RuntimeException("Unable to build URI, cause: " + ex.getMessage(), ex);
		}

		try {
			return HttpClientBuilder.create().build().execute(new HttpHead(uri));
		} catch (IOException ex) {
			throw new RuntimeException("Unable to reach endpoint, cause: " + ex.getMessage(), ex);
		}
	}

	protected AuthenticationHeader extractAuthenticationHeader(HttpResponse response) {
		Header header = response.getFirstHeader("WWW-Authenticate");
		HeaderElement headerElement = header.getElements()[0];
		if (logger.isDebugEnabled()) {
			logger.debug("Extracting authentication from header: " + header);
		}
		String value = header.toString().split(" ")[1];
		String realm = headerElement.getValue();
		if (logger.isDebugEnabled()) {
			logger.debug("Extracted value: " + value + "; realm: " + realm);
		}
		return new AuthenticationHeader(value, realm);
	}

	/**
	 * Constructs a RestTemplate with digest caching enabled.
	 *
	 * @param restConfig
	 * @param provider
	 * @param realm
	 * @return
	 */
	protected RestTemplate prepareDigestTemplate(RestConfig restConfig, CredentialsProvider provider, String realm) {
		final HttpClient httpClient = newHttpClient(provider);
		final HttpHost host = new HttpHost(restConfig.getHost(), restConfig.getRestPort(), restConfig.getScheme());

		// Create AuthCache instance
		final AuthCache authCache = new BasicAuthCache();

		final DigestScheme digestAuth = new DigestScheme();
		digestAuth.overrideParamter("realm", realm);
		authCache.put(host, digestAuth);

		// create a RestTemplate wired with a custom request factory using the above AuthCache with Digest Scheme
		return new RestTemplate(new HttpComponentsClientHttpRequestFactory(httpClient) {
			@Override
			protected HttpContext createHttpContext(HttpMethod httpMethod, URI uri) {
				// Add AuthCache to the execution context
				BasicHttpContext context = new BasicHttpContext();
				context.setAttribute(HttpClientContext.AUTH_CACHE, authCache);
				return context;
			}
		});
	}

}

class AuthenticationHeader {

	private String value;
	private String realm;

	public AuthenticationHeader(String value, String realm) {
		this.value = value;
		this.realm = realm;
	}

	public String getValue() {
		return value;
	}

	public String getRealm() {
		return realm;
	}
}
