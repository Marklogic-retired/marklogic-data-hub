/*
 * Copyright (c) 2023 MarkLogic Corporation
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
package com.marklogic.client.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.modulesloader.ssl.SimpleX509TrustManager;
import io.undertow.Undertow;
import io.undertow.client.ClientCallback;
import io.undertow.client.ClientConnection;
import io.undertow.client.UndertowClient;
import io.undertow.server.HttpServerExchange;
import io.undertow.server.ServerConnection;
import io.undertow.server.handlers.BlockingHandler;
import io.undertow.server.handlers.form.FormData;
import io.undertow.server.handlers.form.FormParserFactory;
import io.undertow.server.handlers.proxy.ProxyCallback;
import io.undertow.server.handlers.proxy.ProxyClient;
import io.undertow.server.handlers.proxy.ProxyConnection;
import io.undertow.server.handlers.proxy.ProxyHandler;
import io.undertow.util.Headers;
import okhttp3.Credentials;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StringUtils;
import org.xnio.IoUtils;
import org.xnio.OptionMap;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.Charset;
import java.security.KeyStore;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Credit to https://stackoverflow.com/a/39531382/3306099 for this, though it's been tweaked a bit.
 * <p>
 * Undertow has an example of a reverse proxy server as well -
 * https://github.com/undertow-io/undertow/tree/master/examples/src/main/java/io/undertow/examples/reverseproxy
 * <p>
 * Note that this does not yet support digest authentication, which seems to be common with reverse proxy servers.
 * That's fine for testing the Java Client, as verifying that the basePath works is not related to what kind of
 * authentication is required by MarkLogic. But you'll need to ensure that any MarkLogic app server you proxy is using
 * either basic or digestbasic authentication.
 * <p>
 * As of 2023-01-26, this can now emulate MarkLogic Cloud. It exposes a "/token" endpoint that proxies to port 8022,
 * which this server listens to as well (currently hardcoded). A fake access token is returned. Subsequent requests
 * convert that fake access token into a basic authentication value that is included in the proxied request to
 * MarkLogic.
 */
public class ReverseProxyServer extends LoggingObject {

	private static final ObjectMapper objectMapper = new ObjectMapper();
	private static final String FAKE_ACCESS_TOKEN_INDICATOR = "FAKE_RPS_TOKEN:";

	/**
	 * Accepts up to 4 args: 1) the MarkLogic hostname to proxy to; 2) the hostname for this server;
	 * 3) the port for this server; 4) the port for the secure (HTTPS) server. For current use cases though, including
	 * Jenkins, localhost should suffice for both hostnames and 8020 should suffice as the port.
	 * <p>
	 * If you wish to enable a secure server on port 443 - i.e. you're looking to emulate MarkLogic Cloud - you'll
	 * need to run this program as root. Check the build.gradle file for this project to see an example of how to do
	 * that via Gradle.
	 *
	 * @param args
	 * @throws Exception
	 */
	public static void main(final String[] args) throws Exception {
		String markLogicHost = "localhost";
		String serverHost = "localhost";
		int serverPort = 8020;
		int secureServerPort = 0;
		List<String> customMappings = new ArrayList<>();

		if (args.length > 0) {
			markLogicHost = args[0];
			if (args.length > 1) {
				serverHost = args[1];
				if (args.length > 2) {
					serverPort = Integer.parseInt(args[2]);
					if (args.length > 3) {
						secureServerPort = Integer.parseInt(args[3]);
						if (args.length > 4 && StringUtils.hasText(args[4])) {
							customMappings = Arrays.asList(args[4].split(","));
						}
					}
				}
			}
		}

		new ReverseProxyServer(markLogicHost, serverHost, serverPort, secureServerPort, customMappings);
	}

	public ReverseProxyServer(String markLogicHost, String serverHost, int serverPort, int secureServerPort, List<String> customMappings) throws Exception {
		logger.info("MarkLogic host: {}", markLogicHost);
		logger.info("Proxy server host: {}", serverHost);
		logger.info("Proxy server HTTP port: {}", serverPort);
		logger.info("Proxy server HTTPS port: {}", secureServerPort);

		// Set up the mapping of paths to MarkLogic ports. Paths with and without forward slashes are used to ensure
		// both work properly.
		Map<String, URI> mapping = new LinkedHashMap<>();

		// Generic mappings for standard MarkLogic app servers
		mapping.put("/local/app-services", new URI(String.format("http://%s:8000", markLogicHost)));
		mapping.put("/local/admin", new URI(String.format("http://%s:8001", markLogicHost)));
		mapping.put("/local/manage", new URI(String.format("http://%s:8002", markLogicHost)));

		// Generic mappings for DHF app servers
		mapping.put("/data-hub/staging", new URI(String.format("http://%s:8010", markLogicHost)));
		mapping.put("/data-hub/final", new URI(String.format("http://%s:8011", markLogicHost)));
		mapping.put("/data-hub/jobs", new URI(String.format("http://%s:8013", markLogicHost)));

		// Emulate MarkLogic Cloud "/token" requests by mapping to the handler defined below that can respond to
		// these requests in a suitable fashion for manual testing.
		mapping.put("/token", new URI(String.format("http://%s:8022", serverHost)));

		for (int i = 0; i < customMappings.size(); i += 2) {
			mapping.put(customMappings.get(i), new URI(String.format("http://%s:%s", serverHost, customMappings.get(i + 1))));
		}

		mapping.entrySet().forEach(entry -> {
			logger.info("Mapped: " + entry.getKey() + " : " + entry.getValue());
		});

		Undertow.Builder undertowBuilder = Undertow.builder()
			.addHttpListener(serverPort, serverHost)
			.addHttpListener(8022, serverHost, new BlockingHandler(exchange -> handleMarkLogicCloudTokenRequest(exchange)))
			.setIoThreads(4)
			.setHandler(ProxyHandler.builder()
				.setProxyClient(new ReverseProxyClient(mapping))
				.setMaxRequestTime(30000)
				.build()
			);

		if (secureServerPort > 0) {
			logger.info("Adding an HTTPS listener on port: " + secureServerPort + "; note that if this port 443 " +
				"or any value less than 1024, you will need to run this process as root.:");
			undertowBuilder.addHttpsListener(secureServerPort, serverHost, buildSSLContext());
		} else {
			logger.info("Not adding an HTTPS listener; to enable one, ensure that the 4th command line argument to " +
				"this program is an integer.");
		}

		undertowBuilder
			.build()
			.start();
	}

	/**
	 * This emulates how MarkLogic Cloud works with a twist - it expects the user's API key to match the pattern
	 * "username:password". It then generates a basic authentication value for this username/password and returns that
	 * as the access token. The replaceFakeMarkLogicCloudHeaderIfNecessary method in ReverseProxyClient will then
	 * replace this fake access token with an appropriate basic authentication header value.
	 *
	 * @param exchange
	 */
	private void handleMarkLogicCloudTokenRequest(HttpServerExchange exchange) {
		try {
			logger.info("Emulating MarkLogic Cloud and handling /token request");
			FormData formData = FormParserFactory.builder().build().createParser(exchange).parseBlocking();
			String apiKey = formData.getFirst("key").getValue();
			String[] tokens = apiKey.split(":");
			String basicAuthValue = Credentials.basic(tokens[0], tokens[1], Charset.forName("UTF-8"));
			ObjectNode response = objectMapper.createObjectNode().put("access_token", FAKE_ACCESS_TOKEN_INDICATOR + basicAuthValue);
			exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "application/json");
			exchange.getResponseSender().send(response.toPrettyString());
		} catch (Exception ex) {
			System.err.println("Unable to process MarkLogic Cloud token request: " + ex.getMessage());
		}
	}

	/**
	 * Constructs an SSLContext based on the src/main/resources/selfsigned.jks keystore. See the README in that
	 * directory for more information on the keystore along with instructions for importing the certificate into your
	 * JVM truststore.
	 *
	 * @return
	 * @throws Exception
	 */
	private SSLContext buildSSLContext() throws Exception {
		final String keyStorePassword = "password";
		KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
		KeyStore keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
		keyStore.load(new ClassPathResource("selfsigned.jks").getInputStream(), keyStorePassword.toCharArray());
		kmf.init(keyStore, keyStorePassword.toCharArray());

		SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
		// Use a "trust-everything" approach for now; the client doesn't have to do this, but we don't have a use case
		// yet for having our reverse proxy server validate certificates.
		sslContext.init(kmf.getKeyManagers(), new TrustManager[]{new SimpleX509TrustManager()}, null);
		return sslContext;
	}

	private static class ReverseProxyClient extends LoggingObject implements ProxyClient {
		private static final ProxyTarget TARGET = new ProxyTarget() {
		};

		private final UndertowClient client;
		private final Map<String, URI> mapping;

		public ReverseProxyClient(Map<String, URI> mapping) {
			this.client = UndertowClient.getInstance();
			this.mapping = mapping;
		}

		@Override
		public ProxyTarget findTarget(HttpServerExchange exchange) {
			return TARGET;
		}

		@Override
		public void getConnection(ProxyTarget target, HttpServerExchange exchange, ProxyCallback<ProxyConnection> callback, long timeout, TimeUnit timeUnit) {
			final String requestURI = exchange.getRequestURI();
			logger.info("Received request: " + requestURI);
			URI targetUri = null;

			replaceFakeMarkLogicCloudHeaderIfNecessary(exchange);

			for (String path : mapping.keySet()) {
				if (requestURI.startsWith(path)) {
					targetUri = mapping.get(path);
					exchange.setRequestURI(requestURI.substring(path.length()));
					break;
				}
			}

			if (targetUri == null) {
				throw new IllegalArgumentException("Unsupported request URI: " + exchange.getRequestURI());
			}

			logger.info("Proxying to: " + targetUri + exchange.getRequestURI());
			client.connect(
				new ConnectNotifier(callback, exchange),
				targetUri,
				exchange.getIoThread(),
				exchange.getConnection().getByteBufferPool(),
				OptionMap.EMPTY);
		}

		/**
		 * Checks to see if the request has the fake MarkLogic Cloud authentication token in it, which is inserted
		 * by the "/token" handler. If so, that token is replaced with a basic authentication value, which requires that
		 * the MarkLogic server use basic or digestbasic authentication.
		 *
		 * @param exchange
		 */
		private void replaceFakeMarkLogicCloudHeaderIfNecessary(HttpServerExchange exchange) {
			final String auth = exchange.getRequestHeaders().getFirst("Authorization");
			final String fakeBearerIndicator = "BEARER " + FAKE_ACCESS_TOKEN_INDICATOR;
			if (auth != null && auth.toUpperCase().startsWith(fakeBearerIndicator)) {
				String basicAuthValue = auth.substring(fakeBearerIndicator.length());
				logger.info("Replacing fake MarkLogic Cloud Authorization header with a basic Authorization header: " + basicAuthValue);
				exchange.getRequestHeaders().put(Headers.AUTHORIZATION, basicAuthValue);
			}
		}

		private final class ConnectNotifier implements ClientCallback<ClientConnection> {
			private final ProxyCallback<ProxyConnection> callback;
			private final HttpServerExchange exchange;

			private ConnectNotifier(ProxyCallback<ProxyConnection> callback, HttpServerExchange exchange) {
				this.callback = callback;
				this.exchange = exchange;
			}

			@Override
			public void completed(final ClientConnection connection) {
				final ServerConnection serverConnection = exchange.getConnection();
				serverConnection.addCloseListener(serverConnection1 -> IoUtils.safeClose(connection));
				callback.completed(exchange, new ProxyConnection(connection, "/"));
			}

			@Override
			public void failed(IOException e) {
				callback.failed(exchange);
			}
		}
	}
}
