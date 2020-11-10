package com.marklogic.hub.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.impl.DocumentWriteOperationImpl;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubClient;

import java.io.ByteArrayInputStream;
import java.util.LinkedHashMap;
import java.util.Map;

public class ReferenceModelProject extends TestObject {

    public final static String INPUT_COLLECTION = "customer-input";

    public final static String CUSTOMER_ENTITY_TYPE = "Customer";
    private HubClient hubClient;
    private DocumentMetadataHandle customerDocumentMetadata;

    public ReferenceModelProject(HubClient hubClient) {
        this.hubClient = hubClient;

        customerDocumentMetadata = new DocumentMetadataHandle()
            .withCollections(CUSTOMER_ENTITY_TYPE)
            .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);

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
        createCustomerInstance(customer, Format.JSON, null);
    }

    public void createCustomerInstance(Customer customer, String databaseType) {
        createCustomerInstance(customer, databaseType, Format.JSON, null);
    }

    public void createCustomerInstance(Customer customer, Format contentFormat, String xmlNamespace) {
        createCustomerInstance(customer, "final", contentFormat, xmlNamespace);
    }

    public void createCustomerInstance(Customer customer, String databaseType, Format contentFormat, String xmlNamespace) {
        GenericDocumentManager mgr = databaseType.equalsIgnoreCase("staging") ? hubClient.getStagingClient().newDocumentManager()
            : hubClient.getFinalClient().newDocumentManager();
        mgr.setContentFormat(contentFormat);
        DocumentWriteSet writeSet = mgr.newWriteSet();
        writeSet.add(buildCustomerInstanceToWrite(customer, contentFormat, xmlNamespace));
        mgr.write(writeSet);
    }

    public DocumentWriteOperation buildCustomerInstanceToWrite(Customer customer, Format contentFormat, String xmlNamespace) {
        Map<String, Object> infoMap = new LinkedHashMap<>();
        infoMap.put("title", CUSTOMER_ENTITY_TYPE);
        infoMap.put("version", "0.0.1");
        infoMap.put("baseUri", "http://example.org/");

        Map<String, Object> customerProps = new LinkedHashMap<>();
        customerProps.put("customerId", customer.customerId);
        customerProps.put("name", customer.name);
        customerProps.put("customerNumber", customer.customerNumber);
        if (customer.customerSince != null) {
            customerProps.put("customerSince", customer.customerSince);
        }

        Map<String, Object> instanceMap = new LinkedHashMap<>();
        instanceMap.put("info", infoMap);
        instanceMap.put(CUSTOMER_ENTITY_TYPE, customerProps);

        Map<String, Object> entityInstanceMap = new LinkedHashMap<>();
        entityInstanceMap.put("instance", instanceMap);

        byte[] instanceBytes;
        ByteArrayInputStream instanceByteStream = null;
        String fileExtension;

        try {
            if (Format.XML.equals(contentFormat)) {
                XmlMapper xmlMapper = new XmlMapper();
                instanceBytes = xmlMapper.writer().withRootName("envelope").writeValueAsBytes(entityInstanceMap);
                String xml = new String(instanceBytes);
                // Some ugly hacking as I don't know how to specify namespaces when writing a Map
                xml = xml.replace("<envelope>", "<envelope xmlns='http://marklogic.com/entity-services'>");
                if (xmlNamespace != null) {
                    xml = xml.replace("<Customer>", "<Customer xmlns='" + xmlNamespace + "'>");
                }
                instanceByteStream = new ByteArrayInputStream(xml.getBytes());
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

        String uri = "/" + CUSTOMER_ENTITY_TYPE + customer.customerId + fileExtension;

        return new DocumentWriteOperationImpl(DocumentWriteOperation.OperationType.DOCUMENT_WRITE,
            uri, customerDocumentMetadata, new InputStreamHandle(instanceByteStream));
    }

    /**
     * Override the metadata object that is used for inserting Customer records.
     *
     * @param customerDocumentMetadata
     */
    public void setCustomerDocumentMetadata(DocumentMetadataHandle customerDocumentMetadata) {
        this.customerDocumentMetadata = customerDocumentMetadata;
    }
}
