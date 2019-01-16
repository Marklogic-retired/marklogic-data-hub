/*
 * Copyright 2012-2019 MarkLogic Corporation
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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.WriteEvent;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.deploy.util.EntityDeploymentUtil;

import java.util.Set;

/*
 * Additional command to load entity model JSON that needs to run after the triggers are loaded.
 */
@Component
public class LoadEntityModelsCommand extends AbstractCommand {

    @Autowired
    private HubConfig hubConfig;

    public LoadEntityModelsCommand() {
        super();
        setExecuteSortOrder(SortOrderConstants.DEPLOY_TRIGGERS + 1);
    }
    
    @Override
    public void execute(CommandContext context) {
        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();
        JSONDocumentManager finalEntityDocMgr = finalClient.newJSONDocumentManager();
        JSONDocumentManager stagingEntityDocMgr = stagingClient.newJSONDocumentManager();
        
        DocumentWriteSet finalWriteSet = finalEntityDocMgr.newWriteSet();
        DocumentWriteSet stagingWriteSet = stagingEntityDocMgr.newWriteSet();
        EntityDeploymentUtil entityDeployUtil = EntityDeploymentUtil.getInstance();
        Set<String> entityURIs = entityDeployUtil.getEntityURIs();
        for (String entityURI : entityURIs) {
            WriteEvent writeEvent = entityDeployUtil.dequeueEntity(entityURI);
        	finalWriteSet.add(entityURI, writeEvent.getMetadata(), writeEvent.getContent());
        	stagingWriteSet.add(entityURI, writeEvent.getMetadata(), writeEvent.getContent());
        }
        if (finalWriteSet.size() > 0) {
            finalEntityDocMgr.write(finalWriteSet);
            stagingEntityDocMgr.write(stagingWriteSet);
        }
        entityDeployUtil.reset();
        finalClient.release();
        stagingClient.release();
    }

    public void setHubConfig(HubConfig hubAdminConfig) {
        this.hubConfig = hubAdminConfig;
    }

}
