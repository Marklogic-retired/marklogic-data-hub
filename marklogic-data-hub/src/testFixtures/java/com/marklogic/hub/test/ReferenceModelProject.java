package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;

public class ReferenceModelProject extends TestObject {

    public final static String INPUT_COLLECTION = "customer-input";

    private HubClient hubClient;

    public ReferenceModelProject(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    public void createRawCustomer(int customerId, String name) {
        JSONDocumentManager mgr = hubClient.getStagingClient().newJSONDocumentManager();
        ObjectNode customer = objectMapper.createObjectNode();
        customer.put("customerId", customerId);
        customer.put("name", name);
        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withCollections(INPUT_COLLECTION)
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        mgr.write("/customer" + customerId + ".json", metadata, new JacksonHandle(customer));
    }

    public void createCustomerInstance(Customer customer) {
        String customerEntityType = "Customer";

        JSONDocumentManager mgr = hubClient.getFinalClient().newJSONDocumentManager();
        ObjectNode customerProps = objectMapper.createObjectNode();
        customerProps.put("customerId", customer.customerId);
        customerProps.put("name", customer.name);
        customerProps.put("customerNumber", customer.customerNumber);
        customerProps.put("customerSince", customer.customerSince);

        ObjectNode infoProp = objectMapper.createObjectNode();
        infoProp.put("title", customerEntityType);
        infoProp.put("version", "0.0.1");
        infoProp.put("baseUri", "http://example.org/");

        ObjectNode instanceProps = objectMapper.createObjectNode();
        instanceProps.set("info", infoProp);
        instanceProps.set(customerEntityType, customerProps);

        JsonNode instance = objectMapper.createObjectNode().set("instance", instanceProps);
        JsonNode envelope = objectMapper.createObjectNode().set("envelope", instance);

        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withCollections(customerEntityType)
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        mgr.write("/" + customerEntityType + customer.customerId + ".json", metadata, new JacksonHandle(envelope));
    }

    public RunFlowResponse runFlow(FlowInputs flowInputs) {
        FlowRunner flowRunner = new FlowRunnerImpl(hubClient);
        RunFlowResponse flowResponse = flowRunner.runFlow(flowInputs);
        flowRunner.awaitCompletion();
        return flowResponse;
    }
}
