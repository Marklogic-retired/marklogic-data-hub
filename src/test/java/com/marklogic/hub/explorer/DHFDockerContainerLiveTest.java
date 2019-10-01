/**
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.HttpClientBuilder;
import org.junit.ClassRule;
import org.junit.Test;
import org.testcontainers.containers.DockerComposeContainer;

import static org.junit.Assert.assertEquals;

public class DHFDockerContainerLiveTest {

    @ClassRule
    public static DockerComposeContainer compose =
        new DockerComposeContainer(
            new File("src/test/resources/dhf-compose.yml")).withLocalCompose(true)
            .withExposedService("dhfServer_1", 18001);

    @Test
    public void running_compose_defined_container_is_accessible_on_configured_port()
        throws Exception {
        HttpClient client = HttpClientBuilder.create().build();

        HttpResponse response = client.execute(
            new HttpGet("http://"
                + compose.getServiceHost("dhfServer_1", 18001)
                + ":" +  compose.getServicePort("dhfServer_1", 8001)));

        assertEquals(200, response.getStatusLine().getStatusCode());
    }
    @Test
    public void givenSimpleWebServerContainer_whenGetReuqest_thenReturnsResponse()
        throws Exception {
        String address = "http://" + compose.getServiceHost("dhfServer_1", 80)
            + ":" + compose.getServicePort("dhfServer_1", 80);
        String response = simpleGetRequest(address);

        assertEquals(response, "Hello World!");
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
}
