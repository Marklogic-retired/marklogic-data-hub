package com.marklogic.hub.legacy.flow.impl;

import com.marklogic.client.FailedRequestException;
import com.marklogic.client.impl.FailedRequest;
import com.marklogic.hub.legacy.flow.RunFlowResponse;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class LegacyFlowRunnerImplTest  {

    @Test
    public void testFlowRunnerException() {
        RunFlowResponse resp = null;
        LegacyFlowRunnerImpl fr = new LegacyFlowRunnerImpl();
        FailedRequest req = new FailedRequest();
        req.setMessageCode("RESTAPI-SRVEXERR");
        req.setMessageString("{\n" +
            "\t\"totalCount\": 3,\n" +
            "\t\"errorCount\": 3,\n" +
            "\t\"completedItems\": [],\n" +
            "\t\"failedItems\": [\"/10287.json\", \"/10310.json\", \"/10328.json\"],\n" +
            "\t\"errors\": []\n" +
            "}");
        req.setStatusString("Plugin error");

        resp = fr.handleFlowRunnerException(new FailedRequestException("failed to apply resource at resources/ml:flow: Plugin error", req));
        Assertions.assertEquals(3, resp.errorCount);
        Assertions.assertEquals(3, resp.totalCount);
    }

    @Test
    public void testFlowRunnerExceptionWithoutPluginError() {
        RunFlowResponse resp = null;
        LegacyFlowRunnerImpl fr = new LegacyFlowRunnerImpl();
        FailedRequest req = new FailedRequest();
        req.setMessageCode("RESTAPI-SRVEXERR");
        req.setMessageString("{\n" +
            "\t\"totalCount\": 3,\n" +
            "\t\"errorCount\": 3,\n" +
            "\t\"completedItems\": [],\n" +
            "\t\"failedItems\": [\"/10287.json\", \"/10310.json\", \"/10328.json\"],\n" +
            "\t\"errors\": []\n" +
            "}");
        req.setStatusString("Failed");
        try {
            fr.handleFlowRunnerException(new FailedRequestException("Not a 'Plugin error' exception", req));
        }
        catch (Exception e) {
            Assertions.assertTrue(e instanceof  RuntimeException);
            e.printStackTrace();
            System.out.println(e.getMessage());
            Assertions.assertTrue(e.getMessage().contains("com.marklogic.client.FailedRequestException: Local message: Not a 'Plugin error' exception"));
        }
    }
}
