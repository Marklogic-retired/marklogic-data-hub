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
package com.marklogic.hub.deploy.commands;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.resource.ResourceManager;

@Component
public class DeployHubPrivilegesCommand extends DeployPrivilegesCommand {
	private List<String> payLoads;
	
	public DeployHubPrivilegesCommand() {
		super();
		payLoads = new ArrayList<String>();
		try (
			InputStream is1 = new ClassPathResource("hub-internal-config/security/privileges/dhf-internal-data-hub.json").getInputStream();
			InputStream is2 = new ClassPathResource("hub-internal-config/security/privileges/dhf-internal-entities.json").getInputStream();
			InputStream is3 = new ClassPathResource("hub-internal-config/security/privileges/dhf-internal-mappings.json").getInputStream();
			InputStream is4 = new ClassPathResource("hub-internal-config/security/privileges/dhf-internal-trace-ui.json").getInputStream();
		) {
			this.payLoads.add(IOUtils.toString(is1, "utf-8"));
			this.payLoads.add(IOUtils.toString(is2, "utf-8"));
			this.payLoads.add(IOUtils.toString(is3, "utf-8"));
			this.payLoads.add(IOUtils.toString(is4, "utf-8"));	       
		} catch (IOException e) {
			throw new DataHubConfigurationException(e);
		}
	}
	
	/**
     * Deploys the privileges if they are not already present
     * @param context The command context for execution.
     */
    @Override
    public void execute(CommandContext context) {
    	payLoads.stream().forEach((String payLoad)->{
    		ObjectNode node = null;
			try {
				node = new ObjectMapper().readValue(payLoad, ObjectNode.class);
			} catch (IOException e1) {
				throw new DataHubConfigurationException(e1);
			}
        	String privName = node.get("privilege-name").asText();
        	ManageClient manageClient = context.getManageClient();
        	try {
        		manageClient.getJsonAsSecurityUser("/manage/v2/privileges/"+ privName + "/properties?kind=uri");
        	}
        	catch(Exception e) {
        		logger.info("Creating privilege "+privName);
        		manageClient.postJsonAsSecurityUser("/manage/v2/privileges/", payLoad);
        	}
    	});    	
    }
    
    /**
     * Undeploys the privileges
     * @param context The command context for execution.
     */
    @Override
    public void undo(CommandContext context) {
    	logger.info("Removing privileges");
        ResourceManager mgr = getResourceManager(context);
        for (String f : this.payLoads) {
        	mgr.delete(f);
            
        }                  
    }
}