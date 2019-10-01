/**
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Duration;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;

import org.junit.ClassRule;
import org.junit.Test;
import org.junit.platform.commons.annotation.Testable;
import org.testcontainers.containers.DockerComposeContainer;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.rnorth.visibleassertions.VisibleAssertions.pass;

@Testable
public class GenericContainerTest {

    DatabaseClient client;
    static final Integer [] EXPORTS_PORT = {8001,8000,8002,8010,8011,8013,7997};
    static final int STARTUP_TIMEOUT = 60;

    @ClassRule
    public static GenericContainer container = new GenericContainer("dhf-hao")
        .withExposedPorts(EXPORTS_PORT)
        .waitingFor(Wait.forListeningPort().withStartupTimeout(Duration.ofSeconds(STARTUP_TIMEOUT)));
//        .withCommand("/bin/sh", "-c", "while true; do echo "
//            + "\"HTTP/1.1 200 OK\n\nHello World!\" | nc -l -p 8001; done");

    @Test
    public void testWaiting() {
        pass("Container starts after waiting");
    }

//    @ClassRule
//    public static GenericContainer simpleWebServer
//        = new GenericContainer("alpine:3.7")
//        .withCommand("/bin/sh", "-c", "while true; do echo "
//            + "\"HTTP/1.1 200 OK\n\nHello World!\" | nc -l -p 80; done")
//        .withExposedPorts(80)
//        .waitingFor(Wait.forListeningPort().withStartupTimeout(Duration.ofSeconds(10)));
//
    @Test
    public void givenSimpleWebServerContainer_whenGetReuqest_thenReturnsResponse0()
        throws Exception {
        String address = "http://"
            + container.getContainerIpAddress()
            + ":" + container.getMappedPort(EXPORTS_PORT[0]);
        String response = simpleGetRequest(address);

        assertEquals(response, "Hello World!");
    }

//    @BeforeEach
//    void setup() {
//        host = simpleWebServer.getServiceHost("simpleWebServer_1", 80);
//        port = simpleWebServer.getServicePort("simpleWebServer_1", 80);
//    }

    @Test
    public void running_compose_defined_container_is_accessible_on_configured_port()
        throws Exception {
        HttpClient client = HttpClientBuilder.create().build();

        HttpResponse response = client.execute(
            new HttpGet("http://"
                + container.getContainerIpAddress()
                + ":" + container.getMappedPort(8001)));

        assertEquals(200, response.getStatusLine().getStatusCode());
    }

    private String simpleGetRequest(String address) throws Exception {
        URL url = new URL(address);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");

        BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        String inputLine;
        StringBuffer content = new StringBuffer();
        while ((inputLine = in.readLine()) != null) {
            content.append(inputLine);
        }
        in.close();

        return content.toString();
    }

    public void setupML() {
        client = DatabaseClientFactory.newClient("localhost", 8011,
            new DatabaseClientFactory.DigestAuthContext("admin", "admin"));

    }

    private void release() {
        client.release();
    }
}
