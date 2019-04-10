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
package com.marklogic.hub.legacy.impl;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.LegacyFlowManager;
import com.marklogic.hub.legacy.collector.impl.LegacyCollectorImpl;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.legacy.flow.impl.LegacyFlowRunnerImpl;
import com.marklogic.hub.main.impl.MainPluginImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;

@Component
public class LegacyFlowManagerImpl extends ResourceManager implements LegacyFlowManager {

    private static final String NAME = "ml:flow";

    private DatabaseClient stagingClient;


    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private Scaffolding scaffolding;

    public LegacyFlowManagerImpl() {
        super();
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    public void setupClient() {
        this.stagingClient = hubConfig.newStagingClient();
        this.stagingClient.init(NAME, this);
    }

    @Override public List<LegacyFlow> getLocalFlows() {
        List<LegacyFlow> flows = new ArrayList<>();

        Path entitiesDir = hubConfig.getHubEntitiesDir();
        File[] entities = entitiesDir.toFile().listFiles((pathname -> pathname.isDirectory()));
        if (entities != null) {
            for (File entity : entities) {
                String entityName = entity.getName();
                flows.addAll(getLocalFlowsForEntity(entityName));
            }
        }
        return flows;
    }

    @Override public List<LegacyFlow> getLocalFlowsForEntity(String entityName) {
        return getLocalFlowsForEntity(entityName, null);
    }

    @Override public List<LegacyFlow> getLocalFlowsForEntity(String entityName, FlowType flowType) {

        List<LegacyFlow> flows = new ArrayList<>();
        Path entitiesDir = hubConfig.getHubEntitiesDir();
        Path entityDir = entitiesDir.resolve(entityName);
        Path inputDir = entityDir.resolve("input");
        Path harmonizeDir = entityDir.resolve("harmonize");
        boolean getInputFlows = false;
        boolean getHarmonizeFlows = false;
        if (flowType == null) {
            getInputFlows = getHarmonizeFlows = true;
        }
        else if (flowType.equals(FlowType.INPUT)) {
            getInputFlows = true;
        }
        else if (flowType.equals(FlowType.HARMONIZE)) {
            getHarmonizeFlows = true;
        }

        if (getInputFlows) {
            File[] inputFlows = inputDir.toFile().listFiles((pathname) -> pathname.isDirectory() && !pathname.getName().equals("REST"));
            if (inputFlows != null) {
                for (File inputFlow : inputFlows) {
                    LegacyFlow flow = getLocalFlow(entityName, inputFlow.toPath(), FlowType.INPUT);
                    if (flow != null) {
                        flows.add(flow);
                    }
                }
            }
        }

        if (getHarmonizeFlows) {
            File[] harmonizeFlows = harmonizeDir.toFile().listFiles((pathname) -> pathname.isDirectory() && !pathname.getName().equals("REST"));
            if (harmonizeFlows != null) {
                for (File harmonizeFlow : harmonizeFlows) {
                    LegacyFlow flow = getLocalFlow(entityName, harmonizeFlow.toPath(), FlowType.HARMONIZE);
                    if (flow != null) {
                        flows.add(flow);
                    }

                }
            }
        }
        return flows;
    }

    @Override public LegacyFlow getFlowFromProperties(Path propertiesFile) {
        String quotedSeparator = Pattern.quote(File.separator);
        /* Extract flowName and entityName from ..../plugins/entities/<entityName>/
         * input|harmonize/<flowName>/flowName.properties
         */
        String floweRegex = ".+" + "plugins" + quotedSeparator + "entities" + quotedSeparator + "(.+)"+ quotedSeparator 
                +"(input|harmonize)" + quotedSeparator + "(.+)" + quotedSeparator + ".+";        
        FlowType flowType = propertiesFile.toString().replaceAll(floweRegex, "$2").equals("input")
                ? FlowType.INPUT : FlowType.HARMONIZE;

        String entityName = propertiesFile.toString().replaceAll(floweRegex, "$1");
        return getLocalFlow(entityName, propertiesFile.getParent(), flowType);
    }

    private LegacyFlow getLocalFlow(String entityName, Path flowDir, FlowType flowType) {
        try {
            String flowName = flowDir.getFileName().toString();
            File propertiesFile = flowDir.resolve(flowName + ".properties").toFile();
            if (propertiesFile.exists()) {
                Properties properties = new Properties();
                FileInputStream fis = new FileInputStream(propertiesFile);
                properties.load(fis);

                // trim trailing whitespaces for properties.
                for (String key : properties.stringPropertyNames()){
                    properties.put(key, properties.get(key).toString().trim());
                }
                fis.close();

                LegacyFlowBuilder flowBuilder = LegacyFlowBuilder.newFlow()
                    .withEntityName(entityName)
                    .withName(flowName)
                    .withType(flowType)
                    .withCodeFormat(CodeFormat.getCodeFormat((String) properties.get("codeFormat")))
                    .withDataFormat(DataFormat.getDataFormat((String) properties.get("dataFormat")))
                    .withMain(new MainPluginImpl((String) properties.get("mainModule"), CodeFormat.getCodeFormat((String) properties.get("mainCodeFormat"))));

                if (flowType.equals(FlowType.HARMONIZE)) {
                    flowBuilder.withCollector(new LegacyCollectorImpl((String) properties.get("collectorModule"), CodeFormat.getCodeFormat((String) properties.get("collectorCodeFormat"))));
                }

                return flowBuilder.build();
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override public List<LegacyFlow> getFlows(String entityName) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        NodeList children = parent.getDocumentElement().getChildNodes();

        ArrayList<LegacyFlow> flows = null;
        if (children.getLength() > 0) {
            flows = new ArrayList<>();
        }

        Node node;
        for (int i = 0; i < children.getLength(); i++) {
            node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                flows.add(LegacyFlowManager.flowFromXml((Element)children.item(i)));
            }
        }
        return flows;
    }

    @Override public LegacyFlow getFlow(String entityName, String flowName) {
        return getFlow(entityName, flowName, null);
    }

    @Override public LegacyFlow getFlow(String entityName, String flowName, FlowType flowType) {
        RequestParameters params = new RequestParameters();
        params.add("entity-name", entityName);
        params.add("flow-name", flowName);
        if (flowType != null) {
            params.add("flow-type", flowType.toString());
        }
        ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ServiceResult res = resultItr.next();
        DOMHandle handle = new DOMHandle();
        Document parent = res.getContent(handle).get();
        return LegacyFlowManager.flowFromXml(parent.getDocumentElement());
    }

    @Override public LegacyFlowRunner newFlowRunner() {
        return new LegacyFlowRunnerImpl(hubConfig);
    }

}
