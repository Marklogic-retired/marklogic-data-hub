/**
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.junit.ClassRule;
import org.junit.Test;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import static org.junit.Assert.assertEquals;

public class GenericContainerLiveTest {

    @ClassRule
    public static GenericContainer simpleWebServer =
        new GenericContainer("alpine:3.7")
            .withExposedPorts(80)
            .waitingFor(Wait.forListeningPort().withStartupTimeout(Duration.ofSeconds(10)))
            //.waitingFor(Wait.forHttp("/"))
            .withCommand("/bin/sh", "-c", "while true; do echo "
                + "\"HTTP/1.1 200 OK\n\nHello World!\" | nc -l -p 80; done");

    @Test
    public void givenSimpleWebServerContainer_whenGetReuqest_thenReturnsResponse()
        throws Exception {
        String address = "http://"
            + simpleWebServer.getContainerIpAddress()
            + ":" + simpleWebServer.getMappedPort(80);
        System.out.println("address: " + address);
        String response = simpleGetRequest(address);
        assertEquals(response, "Hello World!");
    }

    @Test
    public void running_compose_defined_container_is_accessible_on_configured_port()
        throws Exception {
        HttpClient client = HttpClientBuilder.create().build();

        HttpResponse response = client.execute(
            new HttpGet("http://"
                + simpleWebServer.getContainerIpAddress()
                + ":" + simpleWebServer.getMappedPort(80)));

        assertEquals(200, response.getStatusLine().getStatusCode());
    }

    private String simpleGetRequest(String address) throws Exception {
        URL url = new URL(address);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");

        BufferedReader in = new BufferedReader(
            new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuffer content = new StringBuffer();
        while ((inputLine = in.readLine()) != null) {
            content.append(inputLine);
        }
        in.close();

        return content.toString();
    }
}
