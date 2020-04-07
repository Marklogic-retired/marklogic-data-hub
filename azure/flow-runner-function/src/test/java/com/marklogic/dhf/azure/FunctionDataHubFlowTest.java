package com.marklogic.dhf.azure;

import com.microsoft.azure.functions.*;
import org.junit.jupiter.api.Test;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.marklogic.hub.flow.FlowInputs;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Unit test for Function class.
 */
public class FunctionDataHubFlowTest {
    /**
     * Unit test for HttpExampleDataHubFlow method.
     */

    //@Test
    // Utility method used by juni tests
    public HttpStatusType testRun(String reqBody) throws Exception {
        // Setup
        @SuppressWarnings("unchecked") final HttpRequestMessage<Optional<String>> req = mock(HttpRequestMessage.class);

        //this is not used currently by the flow code
        final Map<String, String> queryParams = new HashMap<>();
        queryParams.put("name", "Azure");
        doReturn(queryParams).when(req).getQueryParameters();

        System.out.println("Processing <" + reqBody + ">");
        final Optional<String> queryBody = Optional.of(reqBody);
        doReturn(queryBody).when(req).getBody();

        doAnswer(new Answer<HttpResponseMessage.Builder>() {
            @Override
            public HttpResponseMessage.Builder answer(InvocationOnMock invocation) {
                HttpStatus status = (HttpStatus) invocation.getArguments()[0];
                System.out.println("Invocation Status <" + status + ">");
                return new HttpResponseMessageMock.HttpResponseMessageBuilderMock().status(status);
            }
        }).when(req).createResponseBuilder(any(HttpStatus.class));

        final ExecutionContext context = mock(ExecutionContext.class);
        doReturn(Logger.getGlobal()).when(context).getLogger();

        @SuppressWarnings("unchecked") final OutputBinding<String> msg = (OutputBinding<String>) mock(OutputBinding.class);

        // Invoke
        // Running invalid flow throws Exception. The test fails without the try/catch block.
        HttpStatusType retCode = HttpStatus.OK;
        try {
            final HttpResponseMessage ret = new FunctionDataHubFlow().run(req, msg, context);
            System.out.println(ret.getBody());
            retCode = ret.getStatus();
        } catch (java.lang.RuntimeException ex) {
            System.out.println("testHttpTriggerJava ret <" + ex.getMessage() + ">");
        }

        return retCode;
    }

    // Test with missing flow name in the request body
    @Test
    public void testRunNoFlow() throws Exception {
        System.out.println(">>>Test testRunNoFlow");
        String reqBody = "{ \"host\":\"dummy\", \"username\":\"dummy\", \"password\":\"dummy\" }";
        HttpStatusType retCode = testRun(reqBody);
        assertEquals (HttpStatus.BAD_REQUEST, retCode);
    }

    // Test with incorrect host name (should get java.net.UnknownHostException)
    // Note: If you pass valid values, this could actually run the flow correctly.
    @Test
    public void testRunWithFlow() throws Exception {
        System.out.println(">>>Test testRunWithFlow");
        String reqBody = "{ \"host\":\"dummy\", \"username\":\"dummy\", \"password\":\"dummy\", \"flowName\":\"dummy\" }";
        HttpStatusType retCode = testRun(reqBody);
        assertEquals (HttpStatus.BAD_REQUEST, retCode);
    }

    @Test
    public void testBuildFlowInputs() throws Exception {
        System.out.println(">>>Test testBuildFlow");

        // check for invalid flow name - empty string (simulate {"flow-name": ""} input
        FlowInputs flowInputs = new FunctionDataHubFlow().buildFlowInputs("", "2,3,5");
        assertTrue(flowInputs == null);

        // check for invalid flow name - empty string (simulate missing flow-name entry in the payload
        flowInputs = new FunctionDataHubFlow().buildFlowInputs(null, "2,3,5");
        assertTrue(flowInputs == null);

        //valid flow name
        flowInputs = new FunctionDataHubFlow().buildFlowInputs("flowname", "2,3,5");
        assertTrue(flowInputs != null);
    }

    @Test
    public void testGetValueFromJson() throws Exception {
        System.out.println(">>>Test testGetValueFromJson");
        String reqBody = "{ \"host\":\"dummy-host\", \"username\":\"dummy-user\", \"password\":\"dummy-pwd\", " +
            "\"flowName\":\"dummy-flow\" }";

        FunctionDataHubFlow hubFlow = new FunctionDataHubFlow();
        ObjectMapper objmapper = new ObjectMapper();
        JsonNode jsonNode = objmapper.readTree(reqBody);
        assertEquals("dummy-host", hubFlow.getValueFromJson(jsonNode, "host"));
        assertEquals("dummy-user", hubFlow.getValueFromJson(jsonNode, "username"));
        assertEquals("dummy-pwd", hubFlow.getValueFromJson(jsonNode, "password"));
        assertEquals("dummy-flow", hubFlow.getValueFromJson(jsonNode, "flowName"));
    }

}
