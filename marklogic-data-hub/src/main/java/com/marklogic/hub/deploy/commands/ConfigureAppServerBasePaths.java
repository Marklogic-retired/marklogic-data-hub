package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicNameValuePair;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * ConfigureAppServerBasePaths will configure the staging/final/jobs app-server basepaths in ML cloud environment
 * The basepaths are updated when mlAuthentication is set to cloud
 */

public class ConfigureAppServerBasePaths extends AbstractCommand {

    private final HubConfigImpl hubConfig;
    private ObjectMapper mapper = new ObjectMapper();

    public ConfigureAppServerBasePaths(HubConfig hubConfig) {
        this.hubConfig = (HubConfigImpl) hubConfig;
        setExecuteSortOrder(SortOrderConstants.DEPLOY_OTHER_SERVERS + 1);
    }

    @Override
    public void execute(CommandContext context) {
        if(StringUtils.equals("cloud", hubConfig.getMlAuthentication())) {
            updateAppServersBasePaths();
            waitForGateWayToRestart();
        }
    }

    private void updateAppServersBasePaths() {
        HttpClientBuilder clientBuilder = HttpClientBuilder.create();
        try (CloseableHttpClient httpClient = clientBuilder.build()) {
            String url = "https://" + hubConfig.getHost() + "/api/service/dataHubEndpoints";
            HttpPost postRequest = new HttpPost(url);
            StringEntity entity = new StringEntity(getBastPathConfig());
            postRequest.setHeader("Content-Type", "application/json");
            postRequest.setHeader("Authorization", "bearer " + getAccessToken());
            postRequest.setEntity(entity);
            httpClient.execute(postRequest);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String getAccessToken() {
        String tokenRequestURL = "https://".concat(hubConfig.getHost()).concat("/token");
        HttpClientBuilder clientBuilder = HttpClientBuilder.create();
        try (CloseableHttpClient httpClient = clientBuilder.build()) {
            {
                List<NameValuePair> postParams = new ArrayList<>();
                postParams.add(new BasicNameValuePair("grant_type", "apikey"));
                postParams.add(new BasicNameValuePair("key", hubConfig.getCloudApiKey()));

                HttpPost postRequest = new HttpPost(tokenRequestURL);
                postRequest.setHeader("Content-Type", "application/x-www-form-urlencoded");
                postRequest.setEntity(new UrlEncodedFormEntity(postParams));

                HttpResponse response = httpClient.execute(postRequest);
                HttpEntity entity = response.getEntity();
                byte[] returnedData = IOUtils.toByteArray(entity.getContent());

                JsonNode tokenMap = mapper.readTree(returnedData);
                logger.info("Access Token Map: " + tokenMap);
                return tokenMap.get("access_token").asText();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private String getBastPathConfig() {
        ObjectNode baseConfig = mapper.createObjectNode();
        ObjectNode appServers = mapper.createObjectNode();
        ObjectNode jobServer = mapper.createObjectNode();
        ObjectNode stagingServer = mapper.createObjectNode();
        ObjectNode finalServer = mapper.createObjectNode();

        String[] stagingBasePathArray = hubConfig.getStagingBasePath().split("/");
        String stagingBasePath = stagingBasePathArray[stagingBasePathArray.length - 1];

        String[] finalBasePathArray = hubConfig.getFinalBasePath().split("/");
        String finalBasePath = finalBasePathArray[finalBasePathArray.length - 1];

        String[] jobBasePathArray = hubConfig.getJobBasePath().split("/");
        String jobBasePath = jobBasePathArray[jobBasePathArray.length - 1];

        baseConfig.put("adminPath", hubConfig.getAdminConfig().getBasePath());
        baseConfig.put("appServers", appServers);

        appServers.put("staging", stagingServer);
        appServers.put("final", finalServer);
        appServers.put("jobs", jobServer);

        stagingServer.put("name", hubConfig.getStagingDbName());
        stagingServer.put("path", stagingBasePath.concat("/"));

        finalServer.put("name", hubConfig.getFinalDbName());
        finalServer.put("path", finalBasePath.concat("/"));

        jobServer.put("name", hubConfig.getJobDbName());
        jobServer.put("path", jobBasePath.concat("/"));

        return baseConfig.toString();
    }

    private void waitForGateWayToRestart() {
        DatabaseClient databaseClient = hubConfig.newStagingClient();
        int maxTimeToWaitInMs = 90000;
        int maxRetries = 15;
        int sleepTime = maxTimeToWaitInMs/maxRetries;
        while(!databaseClient.checkConnection().isConnected() && maxRetries > 0) {
            logger.info("Checking gateway status: " + databaseClient.checkConnection().isConnected());
            try {
                Thread.sleep(sleepTime);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            maxRetries --;
        }
        logger.info("Checking gateway status: " + databaseClient.checkConnection().isConnected());
    }
}
