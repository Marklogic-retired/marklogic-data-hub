package com.marklogic.bootstrap;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.job.Job;

import java.io.IOException;
import java.util.List;
import java.util.function.Supplier;
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class Json {
    public static void main(String[] args) throws JsonProcessingException {
/*        String s = "{\n" +
            "    \"jobId\": \"399d8365-55da-4768-a537-b83b4dc06240\",\n" +
            "    \"totalCount\": 1,\n" +
            "    \"errorCount\": 0,\n" +
            "    \"completedItems\": [\n" +
            "        \"/sampleOrder.json\"\n" +
            "    ],\n" +
            "    \"failedItems\": [],\n" +
            "    \"errors\": [],\n" +
            "    \"documents\": {\n" +
            "        \"/sampleOrder.json\": {\n" +
            "            \"content\": {\n" +
            "                \"envelope\": {\n" +
            "                    \"headers\": {},\n" +
            "                    \"triples\": [],\n" +
            "                    \"instance\": {\n" +
            "                        \"Order\": {\n" +
            "                            \"id\": \"832\",\n" +
            "                            \"price\": 15,\n" +
            "                            \"products\": [\n" +
            "                                {\n" +
            "                                    \"Product\": {\n" +
            "                                        \"sku\": \"325353353535\",\n" +
            "                                        \"title\": \"sample product 1\",\n" +
            "                                        \"price\": 22,\n" +
            "                                        \"categories\": [\n" +
            "                                            \"new\",\n" +
            "                                            \"useful\"\n" +
            "                                        ]\n" +
            "                                    }\n" +
            "                                },\n" +
            "                                {\n" +
            "                                    \"Product\": {\n" +
            "                                        \"sku\": \"1111111111\",\n" +
            "                                        \"title\": \"sample product 2\",\n" +
            "                                        \"price\": 50,\n" +
            "                                        \"categories\": [\n" +
            "                                            \"boring\"\n" +
            "                                        ]\n" +
            "                                    }\n" +
            "                                },\n" +
            "                                {\n" +
            "                                    \"Product\": {\n" +
            "                                        \"sku\": \"32\",\n" +
            "                                        \"title\": \"sample missing price product\",\n" +
            "                                        \"price\": null,\n" +
            "                                        \"categories\": [\n" +
            "                                            \"new\",\n" +
            "                                            \"useful\"\n" +
            "                                        ]\n" +
            "                                    }\n" +
            "                                }\n" +
            "                            ]\n" +
            "                        },\n" +
            "                        \"info\": {\n" +
            "                            \"title\": \"Order\",\n" +
            "                            \"version\": \"0.0.1\"\n" +
            "                        }\n" +
            "                    },\n" +
            "                    \"attachments\": {\n" +
            "                        \"envelope\": {\n" +
            "                            \"headers\": {},\n" +
            "                            \"triples\": [],\n" +
            "                            \"instance\": {\n" +
            "                                \"id\": \"832\",\n" +
            "                                \"customer\": \"242\",\n" +
            "                                \"order_date\": \"09/02/2017\",\n" +
            "                                \"ship_date\": \"09/09/2017\",\n" +
            "                                \"products\": [\n" +
            "                                    {\n" +
            "                                        \"sku\": \"325353353535\",\n" +
            "                                        \"title\": \"sample product 1\",\n" +
            "                                        \"price\": \"22.0\",\n" +
            "                                        \"categories\": [\n" +
            "                                            \"new\",\n" +
            "                                            \"useful\"\n" +
            "                                        ]\n" +
            "                                    },\n" +
            "                                    {\n" +
            "                                        \"sku\": \"1111111111\",\n" +
            "                                        \"title\": \"sample product 2\",\n" +
            "                                        \"price\": \"50.0\",\n" +
            "                                        \"categories\": [\n" +
            "                                            \"boring\"\n" +
            "                                        ]\n" +
            "                                    },\n" +
            "                                    {\n" +
            "                                        \"sku\": \"32\",\n" +
            "                                        \"title\": \"sample missing price product\",\n" +
            "                                        \"categories\": [\n" +
            "                                            \"new\",\n" +
            "                                            \"useful\"\n" +
            "                                        ]\n" +
            "                                    }\n" +
            "                                ],\n" +
            "                                \"sku\": \"381192634036\",\n" +
            "                                \"price\": \"15.0\",\n" +
            "                                \"quantity\": \"2.0\",\n" +
            "                                \"discounted_price\": \"13.71\",\n" +
            "                                \"title\": \"elaborate feet\",\n" +
            "                                \"description\": \"sunglasses for elaborate feet\"\n" +
            "                            },\n" +
            "                            \"attachments\": null\n" +
            "                        }\n" +
            "                    }\n" +
            "                }\n" +
            "            },\n" +
            "            \"context\": {\n" +
            "                \"flow\": {},\n" +
            "                \"jobId\": \"\",\n" +
            "                \"attemptStep\": 1,\n" +
            "                \"lastCompletedStep\": 0,\n" +
            "                \"lastAttemptedStep\": 0,\n" +
            "                \"batchErrors\": []\n" +
            "            }\n" +
            "        }\n" +
            "    }\n" +
            "}";
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = null;
        RunFlowResponse j = null;
        try {

             j= mapper.readValue(s, RunFlowResponse.class);
        } catch (IOException e) {
            e.printStackTrace();
        }*/

        String str = "dhf.test";
        Pattern pattern = Pattern.compile("dhf.(.*)");
        Matcher matcher = pattern.matcher(str);

        while (matcher.find()) {
            System.out.println(matcher.group(1));
        }

        //System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(j));
    }


}

