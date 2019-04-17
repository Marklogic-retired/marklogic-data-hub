package com.marklogic.bootstrap;

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.util.CertificateTemplateManagerPlus;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.ApplicationConfig;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.File;
import java.io.IOException;

import javax.annotation.PostConstruct;

@EnableAutoConfiguration
public class UnInstaller extends HubTestBase {

    private static Logger logger = LoggerFactory.getLogger(UnInstaller.class);

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(new Class[]{UnInstaller.class, ApplicationConfig.class});
        app.setWebApplicationType(WebApplicationType.NONE);
        ConfigurableApplicationContext ctx = app.run(new String[] { "--hubProjectDir=" + PROJECT_PATH });
    }

    @PostConstruct
    public void teardownHub() {
        super.init();
        dataHub.initProject();
        dataHub.uninstall();
        if (isCertAuth() || isSslRun()) {
        	ManageClient manageClient = ((HubConfigImpl)getDataHubAdminConfig()).getManageClient();
        	File finalServerFile = getResourceFile("ml-config/servers");
    		File hubServerFile = getResourceFile("hub-internal-config/servers");
    		try {
    			FileUtils.writeStringToFile(new File(finalServerFile, "final-server.json")
    					, FileUtils.readFileToString(new File(System.getProperty("java.io.tmpdir")+"/final-server.json")));
    			FileUtils.writeStringToFile(new File(hubServerFile, "job-server.json")
    					, FileUtils.readFileToString(new File(System.getProperty("java.io.tmpdir")+"/job-server.json")));
    			FileUtils.writeStringToFile(new File(hubServerFile, "staging-server.json")
    					, FileUtils.readFileToString(new File(System.getProperty("java.io.tmpdir")+"/staging-server.json")));
			} catch (IOException e1) {
				throw new RuntimeException(e1);
				
			}
    		ManageConfig manageConfig = manageClient.getManageConfig();
    		
    		manageConfig.setUsername(secUser);
    		manageConfig.setHost(host);
    		manageConfig.setSslContext(certContext);
    		manageClient.setManageConfig(manageConfig);
    		ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();

    	    node.put("ssl-certificate-template", (String)null);
    	    node.put("ssl-client-certificate-authorities", (String)null );
    	    node.put("authentication", "digest");

    		try {
    			manageClient.putJson("/manage/v2/servers/Admin/properties?group-id=Default", node.toString());
    	        manageClient.putJson("/manage/v2/servers/App-Services/properties?group-id=Default", node.toString());
    	        manageClient.putJson("/manage/v2/servers/Manage/properties?group-id=Default", node.toString());
    		}
    		catch(Exception e) {
    			throw new RuntimeException(e);
    		}
    		manageConfig.setScheme("http");
    		manageConfig.setSslContext(null);
    		manageConfig.setPassword(secPassword);
    		manageClient.setManageConfig(manageConfig);
    		CertificateTemplateManagerPlus certManager = new CertificateTemplateManagerPlus(manageClient);
    		try {
    			certManager.delete(dhfCert());
    		}
    		catch(Exception e) {
    			e.printStackTrace();
    		}    	    	
        }
        try {
            deleteProjectDir();
        }
        catch(Exception e) {
            logger.warn("Unable to delete the project directory", e);
        }
  
    }

}
