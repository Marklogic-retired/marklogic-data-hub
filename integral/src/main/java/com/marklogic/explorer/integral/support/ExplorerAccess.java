package com.marklogic.explorer.integral.support;

import static com.marklogic.explorer.integral.support.JsonUtils.toJson;
import static java.net.http.HttpRequest.newBuilder;
import static java.time.temporal.ChronoUnit.SECONDS;

import java.net.Authenticator;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.PasswordAuthentication;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import java.util.Optional;
import java.util.logging.Logger;

import javax.net.ssl.SSLContext;

/**
 * ExplorerAccess.java
 *
 * @author diane
 *
 *         The heart of a client application using java 11 functionality.
 *         I have mixed feelings about this implementation - there are
 *         several alternatives - but using the current java.net.http API
 *         should make the code better.  There is, however, a learning curve...
 *
 */
public class ExplorerAccess {

  private static Logger logger = Logger.getGlobal();

  public enum Protocol {
    HTTP("http"), HTTPS("https");

    private String protocol;

    public String getProtocol() {
      return this.protocol;
    }

    Protocol(String protocol) {
      this.protocol = protocol;
    }
  };

  public String composeAddress(Protocol protocol, String server, String endpoint) {
    return protocol.getProtocol()+"://"+server+"/"+endpoint;
  }

  /**
   * get uses the provided parameters to issue a get request and returns the response to the caller.
   *  Note that any exception is fatal, so the code does nothing special other than throw a
   * RuntimeException
   */
  public HttpResponse get(HttpClient client, String endpoint) {
    try {
      var request = newBuilder(new URI(endpoint)).GET()
          .headers("Content-Type", "application/json", "WWW-Authenticate", "digest")
          .build();
      return client.send(request, BodyHandlers.ofString());
    } catch (Exception e) {
      throw new RuntimeException(e.getMessage() + " getting " + endpoint);
    }
  }

  /**
   * post uses the provided parameters to issue a post request and returns the response to the
   * caller.  Note that any exception is fatal so we don't do anything special other than make 'em
   * RuntimeException and handle them higher.
   */
  public HttpResponse post(HttpClient client, String endpoint, String body) {
    try {
      HttpRequest request = newBuilder(new URI(endpoint))
          .POST(HttpRequest.BodyPublishers.ofString(body))
          .headers("Content-Type", "application/json", "WWW-Authenticate", "digest")
          .timeout(Duration.of(10, SECONDS))  // this is adequate for the test experience
          .build();
      return client.send(request, BodyHandlers.ofString());
    } catch (Exception e) {
      throw new RuntimeException(e.getMessage() + " posting " + body);
    }
  }

  /**
   * simpleClient creates a client suitable for unauthenticated access over http
   */
  public HttpClient simpleClient() {
    return  HttpClient.newHttpClient();
  }

  /**
   * secureClient creates a client suitable for authenticated access over http
   * or https connections
   */
  public HttpClient secureClient(String user, String password) {
    final var clientOption = sslClient(user, password);
    if (clientOption.isEmpty()) {
      throw new RuntimeException("cannot create sslClient");
    }
    return clientOption.get();
  }

  /*
   * create a client that can be used with authentication
   */
  private Optional<HttpClient> sslClient(String user, String pw) {
    try {
      var sslClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1)
          .sslContext(SSLContext.getDefault()).authenticator(new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
              return new PasswordAuthentication(user, pw.toCharArray());
            }
          }).followRedirects(HttpClient.Redirect.ALWAYS).proxy(ProxySelector.getDefault())
          .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL)
          ).build();
      return Optional.of(sslClient);
    } catch (Exception e) {
      return Optional.empty();
    }
  }

  /*
   * create a json representation of a valid login payload
   */
  public static String loginPayload(String user, String password) {
    class Payload {

      private final String username, password;

      Payload(String user, String pw) {
        username = user;
        password = pw;
      }
    }
    Payload p1 = new Payload(user, password);
    return toJson(p1);
  }
}
