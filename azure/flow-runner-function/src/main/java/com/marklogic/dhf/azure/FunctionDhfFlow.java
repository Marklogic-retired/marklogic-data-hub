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
public class FunctionDhfFlow {
    /**
     * This function listens at endpoint "/api/HttpExample". Two ways to invoke it using "curl" command in bash:
     * 1. curl -d "HTTP Body" {your host}/api/HttpExample
     * 2. curl "{your host}/api/HttpExample?name=HTTP%20Query"
     */
    @FunctionName("HttpExampleDhfFlow")
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

            runFlow();
            return request.createResponseBuilder(HttpStatus.OK).body("Hello, " + name).build();
        }
    }

    // Run DHF flow
    public void runFlow() {
        System.out.println ("**** Inside AzureFunction runFlow method");
        // Create a FlowRunner instance.
        FlowRunner flowRunner = new FlowRunnerImpl("13.82.25.33", "admin", "admin");

        // Specify the flow to run.
        FlowInputs inputs = new FlowInputs("my-flow-name");

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
