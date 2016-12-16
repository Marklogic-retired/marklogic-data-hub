package com.marklogic.hub;

import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.plugin.PluginFormat;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.json.JSONException;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class EndToEndTestSjsJson extends HubTestBase {
    private static final String ENTITY = "e2eentity";
    private static Path projectDir = Paths.get(".", "ye-olde-project");

    @BeforeClass
    public static void setup() throws IOException {
        File projectDirFile = projectDir.toFile();
        if (projectDirFile.isDirectory() && projectDirFile.exists()) {
            FileUtils.deleteDirectory(projectDirFile);
        }

        installHub();

        enableDebugging();
        enableTracing();

        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "testinput", FlowType.INPUT,
            PluginFormat.JAVASCRIPT, Format.JSON);
        scaffolding.createFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            PluginFormat.JAVASCRIPT, Format.JSON);

        DataHub dh = new DataHub(getHubConfig());
        dh.clearUserModules();
        dh.installUserModules();

        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/headers/headers.sjs", "e2e-test/sjs-flow/headers/headers.sjs");
        installModule("/entities/" + ENTITY + "/harmonize/testharmonize/triples/triples.sjs", "e2e-test/sjs-flow/triples/triples.sjs");

    }

    @AfterClass
    public static void teardown() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());
    }

    @Test
    public void runFlows() throws IOException, ParserConfigurationException, SAXException, JSONException {
        FlowManager fm = new FlowManager(getHubConfig());
        Flow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);

        stagingDocMgr.write("/input.json", new JacksonHandle(getJsonFromResource("e2e-test/staged.json")));

        JobFinishedListener harmonizeFlowListener = new JobFinishedListener();
        fm.runFlow(harmonizeFlow, 10, 1, harmonizeFlowListener);
        harmonizeFlowListener.waitForFinish();
        String expected = getResource("e2e-test/final.json");
        String actual = finalDocMgr.read("/input.json").next().getContent(new StringHandle()).get();
        JSONAssert.assertEquals(expected, actual, false);
    }
}
