package com.marklogic.explorer.integral.support;

import static com.marklogic.explorer.integral.support.JsonUtils.toJson;

import java.net.http.HttpClient;
import java.net.http.HttpResponse;

public interface IExplorerAccess {

  enum Protocol {
    HTTP("http"), HTTPS("https");

    private String protocol;

    public String getProtocol() {
      return this.protocol;
    }

    Protocol(String protocol) {
      this.protocol = protocol;
    }
  }


  /*
   * create a json representation of a valid login payload
   */
  static String loginPayload(String user, String password) {
    class Payload {

      private final String username, password;

      private Payload(String user, String pw) {
        username = user;
        password = pw;
      }
    }
    Payload p1 = new Payload(user, password);
    return toJson(p1);
  }

  String composeAddress(Protocol protocol, String server, String endpoint);

  HttpResponse get(HttpClient client, String endpoint);

  HttpResponse post(HttpClient client, String endpoint, String body);

  HttpClient simpleClient();

  HttpClient secureClient(String user, String password);

}
