package com.marklogic.hub.cli.client;

import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class RunFlowViaMainTest extends AbstractHubCoreTest {

    @Test
    public void testRunFlow() {
        installProjectInFolder("flow-runner-test");
        runAsDataHubOperator();

        final String flowName = "testFlow";
        makeInputFilePathsAbsoluteInFlow(flowName);

        Main.runCommand(new String[]{
            "runFlow",
            "-host", getHubConfig().getHost(),
            "-username", getHubConfig().getMlUsername(),
            "-password", getHubConfig().getMlPassword(),
            "-flowName", flowName,
            // Including this to verify that -P flags don't break things
            "-PmlStagingPort=" + getHubConfig().getPort(DatabaseKind.STAGING)
        });

        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll"));
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-coll"));
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-tab-coll"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "json-coll"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "json-map"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map"));
    }

    @Test
    public void testURIPrefix() {
        installProjectInFolder("flow-runner-test");
        runAsDataHubOperator();

        final String flowName = "runXqyFuncFlow";
        makeInputFilePathsAbsoluteInFlow(flowName);

        Main.runCommand(new String[]{
            "runFlow",
            "-host", getHubConfig().getHost(),
            "-username", getHubConfig().getMlUsername(),
            "-password", getHubConfig().getMlPassword(),
            "-flowName", flowName,
            // Including this to verify that -P flags don't break things
            "-PmlStagingPort=" + getHubConfig().getPort(DatabaseKind.STAGING),
            "-outputURIPrefix", "/output/"
        });

        EvalResultIterator resultItr = runInDatabase("fn:count(cts:uri-match(\"/output/*.xml\"))", HubConfig.DEFAULT_STAGING_NAME);
        EvalResult res = resultItr.next();
        long count = Math.toIntExact((long) res.getNumber());
        Assertions.assertEquals(count, 1);
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-xqy"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xqy-map"));
    }

    @Test
    void paramsMapHasToBeNonNull() {
        Map<String, String> params = new RunFlowCommand().getParams();
        assertNotNull(params, "jcommander requires that the map backing a DynamicParameter annotation not be null; " +
            "if it is null, then jcommander will throw a null-pointer exception");
    }
}
