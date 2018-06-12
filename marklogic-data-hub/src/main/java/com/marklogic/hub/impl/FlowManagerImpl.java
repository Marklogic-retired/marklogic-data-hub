/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.collector.impl.CollectorImpl;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.JobManager;
import com.marklogic.hub.main.impl.MainPluginImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.regex.Pattern;

public class FlowManagerImpl extends ResourceManager implements FlowManager {
    private static final String HUB_NS = "http://marklogic.com/data-hub";
    private static final String NAME = "ml:flow";

    private DatabaseClient stagingClient;
    private DatabaseClient finalClient;
    private DatabaseClient jobClient;
    private HubConfig hubConfig;
    private JobManager jobManager;

    private DataMovementManager dataMovementManager;

    public FlowManagerImpl(HubConfig hubConfig) {
        super();
        this.hubConfig = hubConfig;
        this.stagingClient = hubConfig.newStagingManageClient();
        this.finalClient = hubConfig.newFinalManageClient();
        this.jobClient = hubConfig.newJobDbClient();
        this.jobManager = JobManager.create(this.jobClient);
        this.dataMovementManager = this.stagingClient.newDataMovementManager();
        this.stagingClient.init(NAME, this);
    }

    @Override public List<Flow> getLocalFlows() {
        List<Flow> flows = new ArrayList<>();

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

    @Override public List<Flow> getLocalFlowsForEntity(String entityName) {
        return getLocalFlowsForEntity(entityName, null);
    }

    @Override public List<Flow> getLocalFlowsForEntity(String entityName, FlowType flowType) {

        List<Flow> flows = new ArrayList<>();
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
                    Flow flow = getLocalFlow(entityName, inputFlow.toPath(), FlowType.INPUT);
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
                    Flow flow = getLocalFlow(entityName, harmonizeFlow.toPath(), FlowType.HARMONIZE);
                    if (flow != null) {
                        flows.add(flow);
                    }

                }
            }
        }
        return flows;
    }

    @Override public Flow getFlowFromProperties(Path propertiesFile) {
        String quotedSeparator = Pattern.quote(File.separator);
        String flowTypeRegex = ".+" + quotedSeparator + "(input|harmonize)" + quotedSeparator + ".+";
        FlowType flowType = propertiesFile.toString().replaceAll(flowTypeRegex, "$1").equals("input")
                ? FlowType.INPUT : FlowType.HARMONIZE;

        String entityName = propertiesFile.toString().replaceAll(".+" + quotedSeparator + "([^/\\\\]+)" + quotedSeparator + "(input|harmonize)" + quotedSeparator + ".+", "$1");
        return getLocalFlow(entityName, propertiesFile.getParent(), flowType);
    }

    private Flow getLocalFlow(String entityName, Path flowDir, FlowType flowType) {
        try {
            String flowName = flowDir.getFileName().toString();
            File propertiesFile = flowDir.resolve(flowName + ".properties").toFile();
            if (propertiesFile.exists()) {
                Properties properties = new Properties();
                FileInputStream fis = new FileInputStream(propertiesFile);
                properties.load(fis);
                fis.close();

                FlowBuilder flowBuilder = FlowBuilder.newFlow()
                    .withEntityName(entityName)
                    .withName(flowName)
                    .withType(flowType)
                    .withCodeFormat(CodeFormat.getCodeFormat((String) properties.get("codeFormat")))
                    .withDataFormat(DataFormat.getDataFormat((String) properties.get("dataFormat")))
                    .withMain(new MainPluginImpl((String) properties.get("mainModule"), CodeFormat.getCodeFormat((String) properties.get("mainCodeFormat"))));

                if (flowType.equals(FlowType.HARMONIZE)) {
                    flowBuilder.withCollector(new CollectorImpl((String) properties.get("collectorModule"), CodeFormat.getCodeFormat((String) properties.get("collectorCodeFormat"))));
                }

                return flowBuilder.build();
            }
        }
        catch(Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override public List<Flow> getFlows(String entityName) {
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

        ArrayList<Flow> flows = null;
        if (children.getLength() > 0) {
            flows = new ArrayList<>();
        }

        Node node;
        for (int i = 0; i < children.getLength(); i++) {
            node = children.item(i);
            if (node.getNodeType() == Node.ELEMENT_NODE) {
                flows.add(FlowManager.flowFromXml((Element)children.item(i)));
            }
        }
        return flows;
    }

    @Override public Flow getFlow(String entityName, String flowName) {
        return getFlow(entityName, flowName, null);
    }

    @Override public Flow getFlow(String entityName, String flowName, FlowType flowType) {
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
        return FlowManager.flowFromXml(parent.getDocumentElement());
    }

    @Override public List<String> getLegacyFlows() {
        List<String> oldFlows = new ArrayList<>();
        Path entitiesDir = hubConfig.getHubEntitiesDir();

        File[] entityDirs = entitiesDir.toFile().listFiles(pathname -> pathname.isDirectory());
        if (entityDirs != null) {
            for (File entityDir : entityDirs) {
                Path inputDir = entityDir.toPath().resolve("input");
                Path harmonizeDir = entityDir.toPath().resolve("harmonize");

                File[] inputFlows = inputDir.toFile().listFiles((pathname) -> pathname.isDirectory() && !pathname.getName().equals("REST"));
                addLegacyFlowToList(oldFlows, entityDir, inputFlows);

                File[] harmonizeFlows = harmonizeDir.toFile().listFiles((pathname) -> pathname.isDirectory() && !pathname.getName().equals("REST"));
                addLegacyFlowToList(oldFlows, entityDir, harmonizeFlows);
            }
        }

        return oldFlows;
    }

    private void addLegacyFlowToList(List<String> oldFlows, File entityDir, File[] flows) {
        if (flows != null) {
            for (File flow : flows) {
                File[] mainFiles = flow.listFiles((dir, name) -> name.matches("main\\.(sjs|xqy)"));
                File[] flowFiles = flow.listFiles((dir, name) -> name.matches(flow.getName() + "\\.xml"));
                if (mainFiles.length < 1 && flowFiles.length == 1) {
                    oldFlows.add(entityDir.getName() + " => " + flow.getName());
                } else if (mainFiles.length == 1 && mainFiles[0].getName().contains(".sjs")) {
                    try {
                        String mainFile = FileUtils.readFileToString(mainFiles[0]);
                        if (mainFile.contains("dhf.xqy")) {
                            oldFlows.add(entityDir.getName() + " => " + flow.getName());
                        }
                    }
                    catch(IOException e) {}
                }
            }
        }
    }

    @Override public List<String> updateLegacyFlows(String fromVersion) {

        Scaffolding scaffolding = Scaffolding.create(hubConfig.getProjectDir(), hubConfig.newFinalManageClient());

        List<String> updatedFlows = new ArrayList<>();
        File[] entityDirs = hubConfig.getHubEntitiesDir().toFile().listFiles(pathname -> pathname.isDirectory());
        if (entityDirs != null) {
            for (File entityDir : entityDirs) {
                updatedFlows.addAll(scaffolding.updateLegacyFlows(fromVersion, entityDir.getName()));
            }
        }

        return updatedFlows;
    }

    @Override public FlowRunner newFlowRunner() {
        return new FlowRunnerImpl(hubConfig);
    }

}
