package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;

import java.io.ByteArrayInputStream;
import java.util.LinkedHashMap;
import java.util.Map;

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
            .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        mgr.write("/customer" + customerId + ".json", metadata, new JacksonHandle(customer));
    }

    public void createCustomerInstance(Customer customer) {
        createCustomerInstance(customer, Format.JSON);
    }

    public void createCustomerInstance(Customer customer, Format contentFormat) {
        String customerEntityType = "Customer";

        Map<String, Object> infoMap = new LinkedHashMap<>();
        infoMap.put("title", customerEntityType);
        infoMap.put("version", "0.0.1");
        infoMap.put("baseUri", "http://example.org/");

        Map<String, Object> customerProps = new LinkedHashMap<>();
        customerProps.put("customerId", customer.customerId);
        customerProps.put("name", customer.name);
        customerProps.put("customerNumber", customer.customerNumber);
        customerProps.put("customerSince", customer.customerSince);

        Map<String, Object> instanceMap = new LinkedHashMap<>();
        instanceMap.put("info", infoMap);
        instanceMap.put(customerEntityType, customerProps);

        Map<String, Object> entityInstanceMap = new LinkedHashMap<>();
        entityInstanceMap.put("instance", instanceMap);

        byte[] instanceBytes;
        ByteArrayInputStream instanceByteStream = null;
        String fileExtension;
        GenericDocumentManager mgr = hubClient.getFinalClient().newDocumentManager();
        mgr.setContentFormat(contentFormat);

        try {
            if(contentFormat.getDefaultMimetype().equals("application/xml")) {
                XmlMapper xmlMapper = new XmlMapper();
                instanceBytes = xmlMapper.writer().withRootName("envelope").writeValueAsBytes(entityInstanceMap);
                instanceByteStream = new ByteArrayInputStream(instanceBytes);
                fileExtension = ".xml";
            } else {
                ObjectMapper mapper = new ObjectMapper();
                instanceBytes = mapper.writer().withRootName("envelope").writeValueAsBytes(entityInstanceMap);
                instanceByteStream = new ByteArrayInputStream(instanceBytes);
                fileExtension = ".json";
            }
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }

        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
                .withCollections(customerEntityType)
                .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        mgr.write("/" + customerEntityType + customer.customerId + fileExtension, metadata, new InputStreamHandle(instanceByteStream));
    }

    public RunFlowResponse runFlow(FlowInputs flowInputs) {
        FlowRunner flowRunner = new FlowRunnerImpl(hubClient);
        RunFlowResponse flowResponse = flowRunner.runFlow(flowInputs);
        flowRunner.awaitCompletion();
        return flowResponse;
    }
}
