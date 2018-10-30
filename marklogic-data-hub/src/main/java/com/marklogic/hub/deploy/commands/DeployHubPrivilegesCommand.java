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

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

import org.apache.commons.io.FileUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.resource.ResourceManager;

public class DeployHubPrivilegesCommand extends DeployPrivilegesCommand {

    /**
     * Deploys the privileges if they are not already present
     * @param context The command context for execution.
     */
    @Override
    public void execute(CommandContext context) {
    	Path src;
		try {
			src = Paths.get(DeployHubPrivilegesCommand.class.getClassLoader().getResource("hub-internal-config/security/privileges").toURI());
		} catch (URISyntaxException e2) {
			 throw new DataHubConfigurationException(e2);
		}
                
		try (Stream<Path> stream = Files.walk(src)){
	        stream.filter(f -> ! Files.isDirectory(f)).forEach(sourcePath -> {
	        	String privFile = null;
				try {
					privFile = FileUtils.readFileToString(sourcePath.toFile());
				} catch (IOException e1) {
					throw new DataHubConfigurationException(e1);
				}
	        	ObjectNode node = null;
				try {
					node = new ObjectMapper().readValue(privFile, ObjectNode.class);
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
	        		manageClient.postJsonAsSecurityUser("/manage/v2/privileges/", privFile);
	        	}
	        });
		} catch (IOException e1) {
			throw new DataHubConfigurationException(e1);
		}
    }
    
    /**
     * Undeploys the privileges
     * @param context The command context for execution.
     */
    @Override
    public void undo(CommandContext context) {
    	File resourceDir = null;
		try {
			resourceDir = new File(DeployHubPrivilegesCommand.class.getClassLoader().getResource("hub-internal-config/security/privileges").toURI());
		} catch (URISyntaxException e) {
			throw new DataHubConfigurationException(e);
		}      
        final ResourceManager mgr = getResourceManager(context);
        for (File f : listFilesInDirectory(resourceDir)) {
            if (logger.isInfoEnabled()) {
                logger.info("Processing file: " + f.getAbsolutePath());
            }
            deleteResource(mgr, context, f);
        }                  
    }
}