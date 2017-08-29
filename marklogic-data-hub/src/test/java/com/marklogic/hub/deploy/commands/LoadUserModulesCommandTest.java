package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;


class LoadUserModulesCommandTest extends HubTestBase {

    LoadUserModulesCommand loadUserModulesCommand;

    @BeforeEach
    public void setup() {
        loadUserModulesCommand = new LoadUserModulesCommand(getHubConfig());
    }

    @Test
    void testIsEntityDir() {
        Path startPath = Paths.get("/tmp/my-project/plugins/entities");
        Path dir = Paths.get("/tmp/my-project/plugins/entities/my-entity");
        assertTrue(loadUserModulesCommand.isEntityDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities");
        assertFalse(loadUserModulesCommand.isEntityDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities/my-entity/input");
        assertFalse(loadUserModulesCommand.isEntityDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities/my-entity/input/my-input-flow");
        assertFalse(loadUserModulesCommand.isEntityDir(dir, startPath));


        // test windows paths
        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity");
        assertTrue(loadUserModulesCommand.isEntityDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        assertFalse(loadUserModulesCommand.isEntityDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity\\input");
        assertFalse(loadUserModulesCommand.isEntityDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity\\input\\my-input-flow");
        assertFalse(loadUserModulesCommand.isEntityDir(dir, startPath));
    }
}
