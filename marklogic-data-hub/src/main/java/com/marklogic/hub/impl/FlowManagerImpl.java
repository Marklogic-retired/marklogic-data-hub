/*
 * Copyright 2012-2019 MarkLogic Corporation
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

package com.marklogic.hub.impl;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowImpl;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class FlowManagerImpl implements FlowManager {

    @Autowired
    private HubConfig hubConfig;

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public Flow getFlow(String flowName) {
        Path flowPath = Paths.get(hubConfig.getFlowsDir().toString(), flowName + FLOW_FILE_EXTENSION);
        InputStream inputStream = null;
        // first, let's check our resources
        inputStream = getClass().getResourceAsStream("/hub-internal-artifacts/flows/"+ flowName + FLOW_FILE_EXTENSION);
        if(inputStream == null) {
            try {
                inputStream = FileUtils.openInputStream(flowPath.toFile());
            } catch (IOException e) {
                // return null if it doesn't exist, so we can check for it.
                return null;
            }
        }
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode node;
        try {
            node = objectMapper.readTree(inputStream);
        } catch (IOException e) {
            throw new DataHubProjectException("Unable to read flow: " + e.getMessage());
        }
        Flow newFlow = createFlowFromJSON(node);
        if(newFlow != null && newFlow.getName().length() > 0){
            return newFlow;
        }
        else {
            throw new DataHubProjectException(flowName +" is not a valid flow");
        }

    }

    @Override
    public String getFlowAsJSON(String flowName) {
        return getFlow(flowName).serialize();
    }

    @Override
    public List<Flow> getFlows() {
        List<String> flowNames = getFlowNames();
        List<Flow> flows = new ArrayList<>();
        for(String flow : flowNames){
            flows.add(getFlow(flow));
        }
        return flows;
    }

    @Override
    public List<String> getFlowNames() {
        // Get all the files with flow.json extension from flows dir
        List<File> files = (List<File>) FileUtils.listFiles(hubConfig.getFlowsDir().toFile(), new String[] {"flow.json"} , false );
        List<String> flowNames = files.stream().map(f ->{
            String fileName = f.getName();
            fileName = fileName.replaceAll("(.+)\\.flow\\.json" , "$1");
            return fileName;
        }).collect(Collectors.toList());

        return flowNames;
    }

    @Override
    public Flow createFlow(String flowName) {
        Flow flow = createFlowFromJSON(getFlowScaffolding());
        flow.setName(flowName);
        return flow;
    }

    @Override
    public Flow createFlowFromJSON(String json) {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = null;
        try {
            node = mapper.readValue(json, JsonNode.class);
        } catch (JsonParseException e) {
            throw new DataHubProjectException("Unable to parse flow json string : "+ e.getMessage());
        } catch (JsonMappingException e1) {
            throw new DataHubProjectException("Unable to parse flow json string : "+ e1.getMessage());
        } catch (IOException e2) {
            throw new DataHubProjectException("Unable to parse flow json string : "+ e2.getMessage());
        }
        return createFlowFromJSON(node);
    }

    @Override
    public Flow createFlowFromJSON(JsonNode json) {
        Flow flow = new FlowImpl();
        flow.deserialize(json);
        return flow;
    }

    @Override
    public void deleteFlow(String flowName) {
        File flowFile = Paths.get(hubConfig.getFlowsDir().toString(), flowName + FLOW_FILE_EXTENSION).toFile();
        if (flowFile.exists()) {
            try {
                FileUtils.forceDelete(flowFile);
            } catch (IOException e){
                throw new DataHubProjectException("Could not delete flow "+ flowName);
            }
        }
        else {
            throw new DataHubProjectException("The specified flow doesn't exist.");
        }

    }

    @Override
    public void saveFlow(Flow flow)  {
        String flowString = flow.serialize();
        String flowFileName = flow.getName() + FLOW_FILE_EXTENSION;
        File file = Paths.get(hubConfig.getFlowsDir().toString(), flowFileName).toFile();
        ObjectNode rootNode;
        FileOutputStream fileOutputStream = null;
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            rootNode = (ObjectNode)objectMapper.readTree(flowString);
            objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
            fileOutputStream = new FileOutputStream(file);
            fileOutputStream.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(rootNode).getBytes());
            fileOutputStream.flush();
            fileOutputStream.close();
        }
        catch (JsonProcessingException e) {
            throw new DataHubProjectException("Could not serialize flow.");
        }
        catch (IOException e) {
            throw new DataHubProjectException("Could not save flow to disk.");
        }
    }

    @Override public FlowRunner newFlowRunner() {
        return new FlowRunnerImpl(hubConfig);
    }

    private JsonNode flowScaffolding = null;

    private JsonNode getFlowScaffolding() {
        if (flowScaffolding != null) {
            return flowScaffolding;
        } else {
            String flowScaffoldingSrcFile = "scaffolding/flowName.flow.json";
            InputStream inputStream = FlowManagerImpl.class.getClassLoader()
                .getResourceAsStream(flowScaffoldingSrcFile);
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                this.flowScaffolding = objectMapper.readTree(inputStream);
                return this.flowScaffolding;
            } catch (IOException e) {
                throw new DataHubProjectException("Unable to parse flow json string : "+ e.getMessage());
            }
        }
    }
}
