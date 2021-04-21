package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.connected.HubFlowRunnerResource;
import com.marklogic.hub.test.ReferenceModelProject;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class RunCustomStepTest extends AbstractHubCoreTest {

    private static final String CUSTOM_STEP_MODULE_PATH = "/custom-modules/custom/simpleCustomStep/simpleCustomStep.sjs";

    @BeforeEach
    void beforeEach() {
        installProjectInFolder("test-projects/simple-custom-step");
    }

    @Test
    void processJson() {
        new ReferenceModelProject(getHubClient()).createRawCustomer(1, "Jane");

        replaceCustomStepModuleWithTemplate();
        runSuccessfulFlow(new FlowInputs("simpleCustomStepFlow").withOption("sourceQuery", "cts.collectionQuery('customer-input')"));
        verifyJsonCustomer();
    }

    @Test
    void processJsonWithInstanceCodeUncommented() {
        new ReferenceModelProject(getHubClient()).createRawCustomer(1, "Jane");

        replaceCustomStepModuleWithTemplateWithInstanceCodeUncommented();
        runSuccessfulFlow(new FlowInputs("simpleCustomStepFlow").withOption("sourceQuery", "cts.collectionQuery('customer-input')"));

        JsonNode customer = getFinalDoc("/customer1.json");

        assertEquals("Jane", customer.get("envelope").get("instance").get("myEntityTypeName").get("name").asText(),
            "Since instance['$type'] was set, the instance data should be nested under an object key matching the value of " +
                "instance['$type']");
        assertEquals("myEntityTypeName", customer.get("envelope").get("instance").get("info").get("title").asText());
        assertEquals("0.0.1", customer.get("envelope").get("instance").get("info").get("version").asText(),
            "Setting instance['$version'] should result in the value being added to envelope/instance/info/version");

        assertEquals("Jane", customer.get("envelope").get("attachments").get(0).get("name").asText(),
            "Since instance[$attachments] was set to the input document, the input document should be in the " +
                "attachments array");
    }

    @Test
    void processJsonUsing542Template() {
        new ReferenceModelProject(getHubClient()).createRawCustomer(1, "Jane");

        getHubClient().getModulesClient().newTextDocumentManager().write(CUSTOM_STEP_MODULE_PATH,
            new StringHandle(DHF_542_TEMPLATE));
        runSuccessfulFlow(new FlowInputs("simpleCustomStepFlow").withOption("sourceQuery", "cts.collectionQuery('customer-input')"));

        assertNotNull(getFinalDoc("/customer1.json"), "The 5.4.2 template returns an empty envelope; the intent of this test is to ensure that the " +
            "code in the 5.4.2 template still works without throwing an error");
    }

    @Test
    void processXml() {
        new ReferenceModelProject(getHubClient()).createRawXmlCustomer(1, "Jane");

        replaceCustomStepModuleWithTemplateModifiedForXml();
        runSuccessfulFlow(new FlowInputs("simpleCustomStepFlow").withOption("sourceQuery", "cts.collectionQuery('customer-input')"));
        verifyXmlCustomer();
    }

    @Test
    void processJsonViaHubFlowRunner() {
        replaceCustomStepModuleWithTemplate();

        HubFlowRunnerResource.Input input = new HubFlowRunnerResource.Input("simpleCustomStepFlow");
        input.addContent("/customer1.json").put("name", "Jane");

        new HubFlowRunnerResource(getHubClient().getStagingClient()).runFlow(input);
        verifyJsonCustomer();
    }

    @Test
    void processXmlViaHubFlowRunner() {
        String input = format("<input><flowName>%s</flowName>", "simpleCustomStepFlow");
        input += "<content><uri>/customer1.xml</uri><value><content><name>Jane</name></content></value></content>";
        input += "</input>";

        replaceCustomStepModuleWithTemplateModifiedForXml();
        new HubFlowRunnerResource(getHubClient().getStagingClient()).runFlowWithXmlInput(input);
        verifyXmlCustomer();
    }

    private void replaceCustomStepModuleWithTemplate() {
        String content = readStringFromClasspath("scaffolding/custom-module/sjs/main-custom.sjs");
        getHubClient().getModulesClient().newTextDocumentManager().write(CUSTOM_STEP_MODULE_PATH,
            new StringHandle(content));
    }

    private void replaceCustomStepModuleWithTemplateWithInstanceCodeUncommented() {
        String content = readStringFromClasspath("scaffolding/custom-module/sjs/main-custom.sjs");
        content = content.replace("// instance['$type'] = 'myEntityTypeName';", "instance['$type'] = 'myEntityTypeName';");
        content = content.replace("// instance['$version'] = '0.0.1';", "instance['$version'] = '0.0.1';");
        content = content.replace("// instance['$attachments'] = [inputDocument];", "instance['$attachments'] = [inputDocument];");
        getHubClient().getModulesClient().newTextDocumentManager().write(CUSTOM_STEP_MODULE_PATH,
            new StringHandle(content));
    }

    /**
     * Makes a couple adjustments to the template for a custom step module so that it will work for an XML input and
     * for writing XML.
     */
    private void replaceCustomStepModuleWithTemplateModifiedForXml() {
        String content = readStringFromClasspath("scaffolding/custom-module/sjs/main-custom.sjs");
        content = content.replace("const instance = inputDocument.toObject();", "const instance = inputDocument;");
        content = content.replace("const outputFormat = 'json';", "const outputFormat = 'xml';");
        getHubClient().getModulesClient().newTextDocumentManager().write(CUSTOM_STEP_MODULE_PATH,
            new StringHandle(content));
    }

    private void verifyJsonCustomer() {
        JsonNode customer = getFinalDoc("/customer1.json");
        assertEquals("Jane", customer.get("envelope").get("instance").get("name").asText(),
            "The default custom step should wrap the input document in an envelope. But since no entity is defined, " +
                "the data is directly under instance");
    }

    private void verifyXmlCustomer() {
        Fragment customer = getFinalXmlDoc("/customer1.xml");
        assertEquals("Jane", customer.getElementValue("/es:envelope/es:instance/content/name"));
    }

    /**
     * This captures the custom step template as defined in DHF 5.4.2 (and also 5.4.0 / 5.4.1). We want to have a test
     * for this so we know it still compiles and works without throwing an error.
     */
    private final static String DHF_542_TEMPLATE = "const DataHub = require(\"/data-hub/5/datahub.sjs\");\n" +
        "const datahub = new DataHub();\n" +
        "\n" +
        "function main(content, options) {\n" +
        "\n" +
        "  //grab the doc id/uri\n" +
        "  let id = content.uri;\n" +
        "\n" +
        "  //here we can grab and manipulate the context metadata attached to the document\n" +
        "  let context = content.context;\n" +
        "\n" +
        "  //let's set our output format, so we know what we're exporting\n" +
        "  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;\n" +
        "\n" +
        "  //here we check to make sure we're not trying to push out a binary or text document, just xml or json\n" +
        "  if (outputFormat !== datahub.flow.consts.JSON && outputFormat !== datahub.flow.consts.XML) {\n" +
        "    datahub.debug.log({\n" +
        "      message: 'The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.',\n" +
        "      type: 'error'\n" +
        "    });\n" +
        "    throw Error('The output format of type ' + outputFormat + ' is invalid. Valid options are ' + datahub.flow.consts.XML + ' or ' + datahub.flow.consts.JSON + '.');\n" +
        "  }\n" +
        "\n" +
        "  /*\n" +
        "  This scaffolding assumes we obtained the document from the database. If you are inserting information, you will\n" +
        "  have to map data from the content.value appropriately and create an instance (object), headers (object), and triples\n" +
        "  (array) instead of using the flowUtils functions to grab them from a document that was pulled from MarkLogic.\n" +
        "  Also you do not have to check if the document exists as in the code below.\n" +
        "\n" +
        "  Example code for using data that was sent to MarkLogic server for the document\n" +
        "  let instance = content.value;\n" +
        "  let triples = [];\n" +
        "  let headers = {};\n" +
        "   */\n" +
        "\n" +
        "  /* Here is an example of a check to make sure it's still present in the cluster before operating on it\n" +
        "  if (!fn.docAvailable(id)) {\n" +
        "    datahub.debug.log({message: 'The document with the uri: ' + id + ' could not be found.', type: 'error'});\n" +
        "    throw Error('The document with the uri: ' + id + ' could not be found.')\n" +
        "  }\n" +
        "  */\n" +
        "\n" +
        "  //grab the 'doc' from the content value space\n" +
        "  let doc = content.value;\n" +
        "\n" +
        "  // let's just grab the root of the document if its a Document and not a type of Node (ObjectNode or XMLNode)\n" +
        "  if (doc && (doc instanceof Document || doc instanceof XMLDocument)) {\n" +
        "    doc = fn.head(doc.root);\n" +
        "  }\n" +
        "\n" +
        "  //get our instance, default shape of envelope is envelope/instance, else it'll return an empty object/array\n" +
        "  //If 'doc' is an xml document,  use datahub.flow.flowUtils.getInstance(doc)\n" +
        "  let instance = datahub.flow.flowUtils.getInstanceAsObject(doc) || {};\n" +
        "\n" +
        "  // get triples, return null if empty or cannot be found\n" +
        "  //If 'doc' is an xml document,  use datahub.flow.flowUtils.getTriples(doc)\n" +
        "  let triples = datahub.flow.flowUtils.getTriplesAsObject(doc) || [];\n" +
        "\n" +
        "  //gets headers, return null if cannot be found\n" +
        "  //If 'doc' is an xml document,  use datahub.flow.flowUtils.getHeaders(doc)\n" +
        "  let headers = datahub.flow.flowUtils.getHeadersAsObject(doc) || {};\n" +
        "\n" +
        "  //If your instance is xml and you want to set attachments, you will first want to convert it to json.\n" +
        "  //instance = datahub.flow.flowUtils.xmlToJson(instance);\n" +
        "\n" +
        "  //If you want to set attachments, uncomment here\n" +
        "  // instance['$attachments'] = doc;\n" +
        "\n" +
        "  //for ES models, you will want to specify entity/version if they are not already part of your instance\n" +
        "  //instance['$type'] = 'myEntity';\n" +
        "  //instance['$version'] = '0.0.1'\n" +
        "\n" +
        "\n" +
        "  //insert code to manipulate the instance, triples, headers, uri, context metadata, etc.\n" +
        "\n" +
        "\n" +
        "  //form our envelope here now, specifying our output format\n" +
        "  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);\n" +
        "\n" +
        "  //create our return content object, we have a handy helper function for creating a json scaffolding, but you\n" +
        "  //can also do a node-based one by using nodebuilder, especially if you're dealing with xml!\n" +
        "  let newContent = datahub.flow.flowUtils.createContentAsObject();\n" +
        "\n" +
        "  //assign our envelope value\n" +
        "  newContent.value = envelope;\n" +
        "\n" +
        "  //assign the uri we want, in this case the same\n" +
        "  newContent.uri = id;\n" +
        "\n" +
        "  //assign the context we want\n" +
        "  newContent.context = context;\n" +
        "\n" +
        "  //now let's return out our content to be written, it can be any combination of\n" +
        "  return newContent;\n" +
        "}\n" +
        "\n" +
        "module.exports = {\n" +
        "  main: main\n" +
        "};";
}
