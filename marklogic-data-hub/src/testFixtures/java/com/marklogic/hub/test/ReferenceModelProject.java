package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;

public class ReferenceModelProject {

    private HubConfigImpl hubConfig;
    private ObjectMapper objectMapper;

    public ReferenceModelProject(HubConfigImpl hubConfig) {
        this.hubConfig = hubConfig;
        this.objectMapper = new ObjectMapper();
    }

    public void createCustomer(int customerId, String name) {
        JSONDocumentManager mgr = hubConfig.newStagingClient().newJSONDocumentManager();
        ObjectNode customer = objectMapper.createObjectNode();
        customer.put("customerId", customerId);
        customer.put("name", name);
        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withCollections("customer-input")
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        mgr.write("/customer" + customerId + ".json", metadata, new JacksonHandle(customer));
    }

    public RunFlowResponse runFlow(FlowInputs flowInputs) {
        FlowRunner flowRunner = new FlowRunnerImpl(hubConfig.getHost(), hubConfig.getMlUsername(), hubConfig.getMlPassword());
        RunFlowResponse flowResponse = flowRunner.runFlow(flowInputs);
        flowRunner.awaitCompletion();
        return flowResponse;
    }
}
