package com.marklogic.dhf.azure;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.QueueOutput;

import java.util.Optional;

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
            @QueueOutput(name = "msg", queueName = "dhf-queue", connection = "AzureWebJobsStorage") OutputBinding<String> msg,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request.");

        // Parse query parameter
        String query = request.getQueryParameters().get("name");
        String name = request.getBody().orElse(query);

        if (name == null) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass a name on the query string or in the request body").build();
        } else {
            // Write the name to the message queue.
            msg.setValue(name);
            String runFlowMessage = "Flow <" + name + "> successfully executed."; //default message
            try {
                runFlow(name);
            } catch (Exception ex) {
                context.getLogger().severe("Exception caught: " + ex.getMessage());
                runFlowMessage = ex.getMessage(); //set to exception
            }
            return request.createResponseBuilder(HttpStatus.OK).body(runFlowMessage).build();
        }
    }

    // Run DataHub flow
    public void runFlow(String flowName) {
        System.out.println ("**** Inside AzureFunction runFlow method");
        // Create a FlowRunner instance.
        FlowRunner flowRunner = new FlowRunnerImpl("localhost", "ml-admin-user", "ml-admin-pwd");

        // Specify the flow to run.
        FlowInputs inputs = new FlowInputs(flowName);

        // To run only a subset of the steps in the flow, uncomment the following line and specify the sequence numbers of the steps to run.
        // inputs.setSteps(Arrays.asList("2,3,4"));

        // Run the flow.
        RunFlowResponse response = flowRunner.runFlowWithoutProject(inputs);

        // Wait for the flow to end.
        flowRunner.awaitCompletion();

        // Display the response.
        System.out.println("Response: " + response);
    }
}
