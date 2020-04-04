package com.marklogic.dhf.azure;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.QueueOutput;

import java.util.Optional;
import java.util.Arrays;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;

/**
 * Azure Functions with HTTP Trigger.
 */
public class FunctionDataHubFlow {
    /**
     * This function listens at endpoint "/api/HttpExampleDataHubFlow". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/HttpExampleDataHubFlow
     * 2. curl "{your host}/api/HttpExampleDataHubFlow?name=HTTP%20Query"
     */
    @FunctionName("HttpExampleDataHubFlow")
    public HttpResponseMessage run(
            @HttpTrigger(name = "req", methods = {HttpMethod.GET, HttpMethod.POST}, authLevel = AuthorizationLevel.ANONYMOUS) HttpRequestMessage<Optional<String>> request,
            @QueueOutput(name = "msg", queueName = "dhf-queue-az", connection = "AzureWebJobsStorage") OutputBinding<String> msg,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");
        HttpStatus httpCode = HttpStatus.OK; // set default return code to OK

        context.getLogger().info("Preparing jsonNode.");
        ObjectMapper objmapper = new ObjectMapper();
        JsonNode jsonNode = null;
        try {
            jsonNode = objmapper.readTree(request.getBody().orElse(null));
        } catch (java.io.IOException ex) {
            httpCode = HttpStatus.BAD_REQUEST;
            return request.createResponseBuilder(httpCode).body(ex.getMessage()).build();
        }

        //we are able to process incoming request body
        context.getLogger().info("Done Preparing jsonNode <" + jsonNode + ">");
        context.getLogger().info("json < " + jsonNode + ">");  //don't do this to avoid logging password

        // Parse request parameters
        String mlHost = getValueFromJson(jsonNode, "host");
        String mlUser = getValueFromJson(jsonNode, "username");
        String mlPassword = getValueFromJson(jsonNode, "password");
        String flowName = getValueFromJson(jsonNode, "flowName");
        String flowSteps = getValueFromJson(jsonNode, "steps");

        String inputData = "host <" + mlHost + "> username <" + mlUser + "> flowName <" + flowName +
            "> steps <" + flowSteps + ">";
        context.getLogger().info("Input data: <" + inputData + ">");

        // flow-steps is optional, so no need to check
        if ((mlHost == null) || (mlUser == null) || (mlPassword == null) || (flowName == null)) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(
                "Please pass values for host/username/password/flowName in the request body").build();
        } else {
            // Write the input values to the message queue (not logging the password though)
            String inputMsg = "host <" + mlHost + "> username <" + mlUser + "> flowName <" + flowName + ">";
            msg.setValue(inputMsg);

            String runFlowMessage = "";
            try {
                runFlowMessage = runFlow(mlHost, mlUser, mlPassword, flowName, flowSteps);
            } catch (Exception ex) {
                context.getLogger().severe("Exception caught: " + ex.getMessage());
                runFlowMessage = ex.getMessage(); //set to exception
                httpCode = HttpStatus.BAD_REQUEST;
            }

            //return the response
            return request.createResponseBuilder(httpCode).body(runFlowMessage).build();
        }
    }

    // simple utility method to retrieve attribute values
    protected String getValueFromJson(JsonNode jsonNode, String key) {
        if (jsonNode == null) {
            return null;
        }
        if (jsonNode.has(key)) {
            return jsonNode.get(key).asText();
        } else {
            return null;
        }
    }

    // Build flow inputs object based on the inputs received from the request payload
    // Returns a valid FlowInputs object OR null in case of invalid inputs
    protected FlowInputs buildFlowInputs(String flowName, String flowSteps) {
        // supports flowname and flowsteps. Do we need to also support JobId and Options?

        //validdate inputs first - look for valid flow name
        if ( (flowName == null) || (flowName.trim().length() <= 0) ) {
            return null;
        }

        // Specify the flow to run.
        FlowInputs inputs = new FlowInputs(flowName);

        // If flow steps are provided, then set them as inputs.
        // Q: Are the flow steps always Integers?
        // Ans: Per Rob, lets treat them as strings for now. So, not adding additional test cases
        // inputs.setSteps(Arrays.asList("2,3,4"))
        if (flowSteps != null) {
            inputs.setSteps(Arrays.asList(flowSteps.split(",")));
        }

        return inputs;
    }

    // Run DataHub flow
    public String runFlow(String mlHost, String mlUser, String mlPassword, String flowName, String flowSteps) {
        System.out.println ("**** Inside AzureFunction runFlow method");
        // Create a FlowRunner instance.
        //FlowRunner flowRunner = new FlowRunnerImpl("localhost", "ml-admin-user", "ml-admin-pwd");
        FlowRunner flowRunner = new FlowRunnerImpl(mlHost, mlUser, mlPassword);

        // Specify the flow to run.
        FlowInputs inputs = buildFlowInputs(flowName, flowSteps);
        if (inputs == null) {
            return "Invalid flow inputs. Please check.";
        }

        // Run the flow.
        RunFlowResponse response = flowRunner.runFlowWithoutProject(inputs);

        // Wait for the flow to end.
        flowRunner.awaitCompletion();

        // Return the response.
        //System.out.println("runFlow Response: " + response);
        return response.toString();
    }
}
