package com.marklogic.dhf.azure;

import com.microsoft.azure.functions.*;
import com.microsoft.azure.functions.annotation.AuthorizationLevel;
import com.microsoft.azure.functions.annotation.FunctionName;
import com.microsoft.azure.functions.annotation.HttpTrigger;
import com.microsoft.azure.functions.annotation.QueueOutput;

import java.util.Arrays;
import java.util.Optional;
import java.util.Properties;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.mgmt.util.SimplePropertySource;

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
        String host = getValueFromJson(jsonNode, "host");
        String username = getValueFromJson(jsonNode, "username");
        String password = getValueFromJson(jsonNode, "password");
        String flowName = getValueFromJson(jsonNode, "flowName");
        String steps = getValueFromJson(jsonNode, "steps");
        // By default we assume there's a LB, given this is a Cloud env. However, user can optionally
        // indicate there is NO LB and can connect to ML DB directly.
        // This is optional parameter. Valies values (if provided) are: 'DIRECT' or 'LoadBalancer'
        String connection_type = getValueFromJson(jsonNode, "connection_type");  //

        String inputData = "host <" + host + "> username <" + username + "> flowName <" + flowName +
            "> steps <" + steps + ">";
        context.getLogger().info("Input data: <" + inputData + ">");

        // flow-steps is optional, so no need to check
        if ((host == null) || (username == null) || (password == null) || (flowName == null)) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body(
                "Please pass values for host/username/password/flowName in the request body").build();
        } else {
            // Write the input values to the message queue (not logging the password though)
            String inputMsg = "host <" + host + "> username <" + username + "> flowName <" + flowName + ">";
            msg.setValue(inputMsg);

            String runFlowMessage = "";
            try {
                runFlowMessage = runFlow(host, username, password, flowName, steps, connection_type);
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
    protected FlowInputs buildFlowInputs(String flowName, String steps) {
        // supports flowname and steps. Do we need to also support JobId and Options?

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
        if (steps != null) {
            inputs.setSteps(Arrays.asList(steps.split(",")));
        }

        return inputs;
    }

    // Build a FlowRunner object based on connection type
    public FlowRunner buildFlowRunner(String host, String username, String password, String connection_type) {
        // lets validate connection_type. Inputs could be null or various cases of DIRECT or LoadBalancer
        // need to handle users potentially providing different cases: lower, upper, mixedCase, training spaces etc.
        boolean isLoadBalancer = true;  // we default to LB given its a cloud env
        if (connection_type != null) { //we've a non-null string value now
            if (connection_type.trim().equalsIgnoreCase("DIRECT")) {
                isLoadBalancer = false;
            }
        }

        // DIRECT
        if (!isLoadBalancer) {
            return new FlowRunnerImpl(host, username, password);
        } else {
            //OK. we are dealing with an env with LoadBalancer. Need to handle things diffrently
            HubConfigImpl hubConfig = HubConfigImpl.withDefaultProperties();

            Properties props = new Properties();
            props.setProperty("mlIsHostLoadBalancer", "true"); //this is important for HubConfig to recognize LB
            hubConfig.applyProperties(new SimplePropertySource(props));

            hubConfig.setHost(host);
            hubConfig.setMlUsername(username);
            hubConfig.setMlPassword(password);
            hubConfig.setAuthMethod(DatabaseKind.STAGING, "basic");
            hubConfig.setSimpleSsl(DatabaseKind.STAGING, true);
            hubConfig.setAuthMethod(DatabaseKind.JOB, "basic");
            hubConfig.setSimpleSsl(DatabaseKind.JOB, true);
            hubConfig.setAuthMethod(DatabaseKind.FINAL, "basic");
            hubConfig.setSimpleSsl(DatabaseKind.FINAL, true);

            hubConfig.hydrateConfigs();

            return new FlowRunnerImpl(hubConfig);
        }
    }

    // Run DataHub flow
    public String runFlow(String host, String username, String password, String flowName, String steps,
                          String connection_type) {
        //System.out.println ("**** Inside AzureFunction runFlow method");
        // Create a FlowRunner instance.
        FlowRunner flowRunner = buildFlowRunner(host, username, password, connection_type);

        // Specify the flow to run.
        FlowInputs inputs = buildFlowInputs(flowName, steps);
        if (inputs == null) {
            return "Invalid flow inputs. Please check.";
        }

        // Run the flow.
        //RunFlowResponse response = flowRunner.runFlowWithoutProject(inputs);
        RunFlowResponse response = flowRunner.runFlow(inputs);

        // Wait for the flow to end.
        flowRunner.awaitCompletion();

        // Return the response.
        return response.toString();
    }
}
