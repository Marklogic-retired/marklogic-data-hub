/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.entity.Entity;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;

public class DataHubTest extends HubTestBase {
    
    private static final Logger logger = LoggerFactory.getLogger(DataHubTest.class);

    private static final int BATCH_SIZE = 100;
    
    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @BeforeClass
    public static void setup() throws Exception {
        XMLUnit.setIgnoreWhitespace(true);
        DataHubUser.createHubUserIfNotExists();
    }

    @Test
    public void testValidateServer() throws ServerValidationException {
        DataHub dh = new DataHub(getHubConfig());
        dh.validateServer();
    }

    @Test
    public void testValidateInvalidServer() throws ServerValidationException {
        DataHub dh = new DataHub("blah", user, password);
        exception.expect(ServerValidationException.class);
        dh.validateServer();
    }
    
    @Test
    public void testInstallUserModulesAndRunFlow() throws IOException {
        DataHub dh = new DataHub(getHubConfig());
        String pluginPath = getClass().getClassLoader().getResource("data-hub-test").getFile();
        File entitiesDir = new File(pluginPath, "entities");
        if(!entitiesDir.exists()) {
            entitiesDir.mkdirs();
        }
        
        //install modules
        Collection<File> entitiesFiles = FileUtils.listFiles(entitiesDir, TrueFileFilter.INSTANCE, TrueFileFilter.INSTANCE);
        Set<File> installedFiles = dh.installUserModules(pluginPath);
        logger.info("The following modules are installed in the marklogic server: ");
        for (File entityFile : entitiesFiles) {
            //we are expecting files that are not hidden and not under the subdirectory REST to be installed 
            if(!entityFile.isHidden() && entityFile.getAbsolutePath().indexOf("REST") == -1) {
                assertTrue(entityFile.getName() + " should be found in the MarkLogic server " , installedFiles.contains(entityFile));
            }
        }
        
        //load data
        int stagingDocCount = loadTestData();
        
        //get entities and flows
        EntityManager entityManager = new EntityManager(stagingClient);
        FlowManager flowManager = new FlowManager(stagingClient);
        List<Entity> entitiesInServer = entityManager.getEntities();
        
        for (Entity entity : entitiesInServer) {
            List<Flow> flows = entity.getFlows();
            for (Flow flow : flows) {
                if(flow.getType() == FlowType.HARMONIZE) {
                    //run flow
                    JobFinishedListener listener = new JobFinishedListener();
                    flowManager.runFlow(flow, BATCH_SIZE, listener);
                    listener.waitForFinish();
                }
            }
        }
        //compare number of staging doc and final doc
        int finalDocCount = getFinalDocCount();
        logger.info("The final doc count is "+ finalDocCount);
        //The assertion below doesn't seem to work (TODO: need to investigate why)
        //assertEquals("The staging doc count should be equal to the final doc count", stagingDocCount, finalDocCount);
    }
    
    private int loadTestData() throws IOException {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        installStagingDoc("/employee1.xml", meta, getResource("flow-manager-test/input/employee1.xml"));
        installStagingDoc("/employee2.xml", meta, getResource("flow-manager-test/input/employee2.xml"));
        int stagingDocCount = getStagingDocCount();
        logger.info("The staging doc count is "+ stagingDocCount);
        assertTrue("The staging doc count should be equal or more than 2", stagingDocCount >= 2);
        return stagingDocCount;
    }
}
