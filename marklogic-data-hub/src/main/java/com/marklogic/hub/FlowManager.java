/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.collector.impl.CollectorImpl;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.JobManager;
import com.marklogic.hub.main.impl.MainPluginImpl;
import com.marklogic.hub.scaffold.Scaffolding;
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

public class FlowManager extends ResourceManager {
    private static final String HUB_NS = "http://marklogic.com/data-hub";
    private static final String NAME = "flow";

    private DatabaseClient stagingClient;
    private DatabaseClient finalClient;
    private DatabaseClient jobClient;
    private HubConfig hubConfig;
    private JobManager jobManager;

    private DataMovementManager dataMovementManager;

    public FlowManager(HubConfig hubConfig) {
        super();
        this.hubConfig = hubConfig;
        this.stagingClient = hubConfig.newStagingClient();
        this.finalClient = hubConfig.newFinalClient();
        this.jobClient = hubConfig.newJobDbClient();
        this.jobManager = new JobManager(this.jobClient);
        this.dataMovementManager = this.stagingClient.newDataMovementManager();
        this.stagingClient.init(NAME, this);
    }


    /**
     * retrieves a list of all the flows on the local files systems
     * @return a list of Flows
     */
    public List<Flow> getLocalFlows() {
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

    public List<Flow> getLocalFlowsForEntity(String entityName) {
        return getLocalFlowsForEntity(entityName, null);
    }

    public List<Flow> getLocalFlowsForEntity(String entityName, FlowType flowType) {

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

    public Flow getFlowFromProperties(Path propertiesFile) {
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

    /**
     * Retrieves a list of flows installed on the MarkLogic server
     *
     * @param entityName
     *            - the entity from which to fetch the flows
     * @return - a list of flows for the given entity
     */
    public List<Flow> getFlows(String entityName) {
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
                flows.add(flowFromXml((Element)children.item(i)));
            }
        }
        return flows;
    }

    /**
     * Retrieves a named flow from a given entity
     *
     * @param entityName
     *            - the entity that the flow belongs to
     * @param flowName
     *            - the name of the flow to get
     * @return the flow
     */
    public Flow getFlow(String entityName, String flowName) {
        return getFlow(entityName, flowName, null);
    }

    public Flow getFlow(String entityName, String flowName, FlowType flowType) {
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
        return flowFromXml(parent.getDocumentElement());
    }

    public List<String> getLegacyFlows() {
        List<String> oldFlows = new ArrayList<>();
        Path entitiesDir = hubConfig.getHubEntitiesDir();

        File[] entityDirs = entitiesDir.toFile().listFiles(pathname -> pathname.isDirectory());
        if (entityDirs != null) {
            for (File entityDir : entityDirs) {
                Path inputDir = entityDir.toPath().resolve("input");
                Path harmonizeDir = entityDir.toPath().resolve("harmonize");


                File[] inputFlows = inputDir.toFile().listFiles((pathname) -> pathname.isDirectory() && !pathname.getName().equals("REST"));
                if (inputFlows != null) {
                    for (File inputFlow : inputFlows) {
                        File[] mainFiles = inputFlow.listFiles((dir, name) -> name.matches("main\\.(sjs|xqy)"));
                        File[] flowFiles = inputFlow.listFiles((dir, name) -> name.matches(inputFlow.getName() + "\\.xml"));
                        if (mainFiles.length < 1 && flowFiles.length == 1) {
                            oldFlows.add(entityDir.getName() + " => " + inputFlow.getName());
                        }
                    }
                }

                File[] harmonizeFlows = harmonizeDir.toFile().listFiles((pathname) -> pathname.isDirectory() && !pathname.getName().equals("REST"));
                if (harmonizeFlows != null) {
                    for (File harmonizeFlow : harmonizeFlows) {
                        File[] mainFiles = harmonizeFlow.listFiles((dir, name) -> name.matches("main\\.(sjs|xqy)"));
                        File[] flowFiles = harmonizeFlow.listFiles((dir, name) -> name.matches(harmonizeFlow.getName() + "\\.xml"));
                        if (mainFiles.length < 1 && flowFiles.length == 1) {
                            oldFlows.add(entityDir.getName() + " => " + harmonizeFlow.getName());
                        }
                    }
                }
            }
        }

        return oldFlows;
    }

    public List<String> updateLegacyFlows(String fromVersion) {

        Scaffolding scaffolding = new Scaffolding(hubConfig.getProjectDir(), hubConfig.newFinalClient());

        List<String> updatedFlows = new ArrayList<>();
        File[] entityDirs = hubConfig.getHubEntitiesDir().toFile().listFiles(pathname -> pathname.isDirectory());
        if (entityDirs != null) {
            for (File entityDir : entityDirs) {
                updatedFlows.addAll(scaffolding.updateLegacyFlows(fromVersion, entityDir.getName()));
            }
        }

        return updatedFlows;
    }

    public FlowRunner newFlowRunner() {
        return new FlowRunnerImpl(hubConfig);
    }

    /**
     * Turns an XML document into a flow
     * @param doc - the xml document representing a flow
     * @return a Flow instance
     */
    public static Flow flowFromXml(Element doc) {
        return FlowImpl.fromXml(doc);
    }
}
