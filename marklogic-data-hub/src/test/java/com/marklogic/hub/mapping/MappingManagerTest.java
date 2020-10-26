/*
 * Copyright (c) 2020 MarkLogic Corporation
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
package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.util.FileUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.fail;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class MappingManagerTest extends AbstractHubCoreTest {

    private String mappingName = "my-fun-test";

    @Autowired
    MappingManager mappingManager;

    @Test
    public void createMapping() {
        //Create our mapping via the exposed java api
        ObjectMapper mapper = new ObjectMapper();
        Mapping testMap = Mapping.create(mappingName);
        testMap.setDescription("This is a test.");
        testMap.setSourceContext("/fake/path");
        testMap.setTargetEntityType("http://marklogic.com/example/Schema-0.0.2/Person");
        HashMap<String, ObjectNode> properties = new HashMap<>();
        ObjectNode id = mapper.createObjectNode();
        id.put("sourcedFrom", "id");
        properties.put("id", id);
        ObjectNode name = mapper.createObjectNode();
        name.put("sourcedFrom", "name");
        properties.put("name", name);
        testMap.setProperties(properties);
        //we should now have a fully fleshed out, in memory mapping object that was created
        //So let's try saving it!
        mappingManager.saveMapping(testMap);

        //now let's see if it's on disk!
        String mappingFileName = testMap.getName() + "-" + testMap.getVersion() + MappingManager.MAPPING_FILE_EXTENSION;
        assertTrue(Paths.get((getHubProject().getHubMappingsDir().toString()), mappingName, mappingFileName).toFile().exists());

    }

    @Test
    public void getMapping() {
        copyTestMap();

        //here, we're going to get the mapping we just made
        Mapping testMap = mappingManager.getMapping(mappingName);
        assertTrue(testMap != null);
        assertTrue(testMap.getName().equalsIgnoreCase(mappingName));

    }

    @Test
    public void getMappingNames() {
        copyTestMap();

        //get a list of names to be returned of exiting mappings
        ArrayList<String> mappingNames = mappingManager.getMappingsNames();
        assertTrue(mappingNames.size() > 0);

    }

    @Test
    public void getMappingFromJSON() {
        copyTestMap();
        //Now let's get the same mapping, but out of band off disk as JSON
        String json = mappingManager.getMappingAsJSON(mappingName);

        logger.debug(json);
        // is this appropriate, a length check on the json?
        //assertTrue(json.length() == 253);
        //now let's see if this parses properly
        ObjectMapper mapper = new ObjectMapper();
        try {
            JsonNode node = mapper.readTree(json);
            assertTrue(node.get("name").asText().equalsIgnoreCase(mappingName));
        } catch (IOException e) {
            fail("Can not parse json response.");
        }
    }

    @Test
    public void updateMapping() {
        copyTestMap();
        //Get the mapping, update it, and save the new version back
        Mapping testMap = mappingManager.getMapping(mappingName);
        //make sure it's the right map
        assertTrue(testMap.getVersion() == 1);
        assertTrue(testMap.getName().equalsIgnoreCase(mappingName));

        //Manipulate it
        String newDesc = "This is a new Description.";
        testMap.setDescription(newDesc);
        String newContext = "/path/is/updated";
        testMap.setSourceContext(newContext);
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode newNode = mapper.createObjectNode();
        newNode.put("sourcedFrom", "test");
        testMap.getProperties().put("test", newNode);

        //Let's save it and auto increment version
        mappingManager.saveMapping(testMap, true);

        //now let's check the in memory instance
        assertTrue(testMap.getVersion() == 2);
        assertFalse(testMap.serialize().contains("language"));
        assertTrue(testMap.getDescription().equalsIgnoreCase(newDesc));
        assertTrue(testMap.getProperties().size() == 3);
        assertTrue(testMap.getSourceContext().equalsIgnoreCase(newContext));

        //now let's pull the map back from disk and compare it to our in memory
        Mapping testMapDisk = mappingManager.getMapping(mappingName);
        assertTrue(testMapDisk.getVersion() == testMap.getVersion());
        assertTrue(testMapDisk.getDescription().equalsIgnoreCase(newDesc));
        assertTrue(testMapDisk.getDescription().equalsIgnoreCase(testMap.getDescription()));

    }

    @Test
    public void getMostRecentMapping() {
        copyTestMap();
        //add a new version of the map
        copySecondTestMap();
        //get most recent version of the mapping
        Mapping testMap = mappingManager.getMapping(mappingName);
        assertTrue(testMap.getVersion() == 2);
    }

    @Test
    public void getMappingByVersion() {
        copyTestMap();
        //add a new version of the map
        copySecondTestMap();
        //get an older version of the mapping
        Mapping testMap = mappingManager.getMapping(mappingName, 1, false);
        assertTrue(testMap.getVersion() == 1);
    }

    @Test
    public void deleteMapping() {
        //reput that mapping from create there
        copyTestMap();

        //now let's erase the mapping
        //check to see if its there
        Mapping testMap = mappingManager.getMapping(mappingName);
        assertTrue(testMap != null);
        //check to make sure its on disk
        String mappingFileName = testMap.getName() + "-" + testMap.getVersion() + MappingManager.MAPPING_FILE_EXTENSION;
        assertTrue(Paths.get((getHubProject().getHubMappingsDir().toString()), mappingName, mappingFileName).toFile().exists());

        //now let's delete it
        mappingManager.deleteMapping(mappingName);

        //make sure it's gone off disk
        assertFalse(Paths.get((getHubProject().getHubMappingsDir().toString()), mappingName, mappingFileName).toFile().exists());

    }

    private void copyTestMap() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + mappingName + "-1" + MappingManager.MAPPING_FILE_EXTENSION),
            getHubProject().getHubMappingsDir().resolve(mappingName + "/" + mappingName + "-1" + MappingManager.MAPPING_FILE_EXTENSION).toFile());
    }

    private void copySecondTestMap() {
        FileUtil.copy(getResourceStream("scaffolding-test/" + mappingName + "-2" + MappingManager.MAPPING_FILE_EXTENSION),
            getHubProject().getHubMappingsDir().resolve(mappingName + "/" + mappingName + "-2" + MappingManager.MAPPING_FILE_EXTENSION).toFile());
    }
}
