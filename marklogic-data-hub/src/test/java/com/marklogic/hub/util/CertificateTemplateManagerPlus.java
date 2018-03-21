package com.marklogic.hub.util;

import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ResourceUtils;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.resource.security.CertificateTemplateManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;

public class CertificateTemplateManagerPlus extends CertificateTemplateManager{

	public CertificateTemplateManagerPlus(ManageClient client) {
		super(client);
		// TODO Auto-generated constructor stub
	}
	
    public ResponseEntity<String> setCertificatesForTemplate(String templateIdOrName) throws IOException{
        ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();
                
        String cert = FileUtils.readFileToString(ResourceUtils.getFile("classpath:ssl/dhf-server.crt"));
        String pkey = FileUtils.readFileToString(ResourceUtils.getFile("classpath:ssl/pkey.pem"));
        
        ObjectNode certNode = node.objectNode();
        certNode.put("cert", cert );
        certNode.put("pkey", pkey);
               
        ObjectNode certsNode = node.objectNode();
        certsNode.put("certificate", certNode);
        
        node.put("operation", "insert-host-certificates");
        node.arrayNode().add(certNode);
        node.put("certificates", certsNode);
        
        String json = node.toString();
        return postPayload(getManageClient(), getResourcePath(templateIdOrName), json);
    }
	
}