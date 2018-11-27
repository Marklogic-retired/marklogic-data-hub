package com.marklogic.hub.util;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.resource.security.CertificateTemplateManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.apache.commons.io.FileUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ResourceUtils;

import java.io.IOException;

public class CertificateTemplateManagerPlus extends CertificateTemplateManager{

	public CertificateTemplateManagerPlus(ManageClient client) {
		super(client);
	}

    public ResponseEntity<String> setCertificatesForTemplate(String templateIdOrName) throws IOException{
        ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();

        String cert = FileUtils.readFileToString(ResourceUtils.getFile("classpath:ssl/dhf-server.crt"));
        String pkey = FileUtils.readFileToString(ResourceUtils.getFile("classpath:ssl/pkey.pem"));

        node.put("operation", "insert-host-certificates");

        ObjectNode certsNode = node.putObject("certificates");
        ObjectNode certNode = certsNode.putObject("certificate");
        certNode.put("cert", cert );
        certNode.put("pkey", pkey);

        // was this intentional?  It didn't look like it does anything
        //node.arrayNode().add(certNode);


        String json = node.toString();
        return postPayload(getManageClient(), getResourcePath(templateIdOrName), json);
    }

}
