package com.marklogic.hub.tools;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;

/**
 * Tool for generating the files that comprise a Data Service endpoint. See the build.gradle file in this project for a
 * task that will execute this.
 */
public class DataServiceGenerator {

    private final static String MODULE_TEMPLATE = "/**\n" +
        " Copyright (c) 2020 MarkLogic Corporation\n" +
        "\n" +
        " Licensed under the Apache License, Version 2.0 (the \"License\");\n" +
        " you may not use this file except in compliance with the License.\n" +
        " You may obtain a copy of the License at\n" +
        "\n" +
        " http://www.apache.org/licenses/LICENSE-2.0\n" +
        "\n" +
        " Unless required by applicable law or agreed to in writing, software\n" +
        " distributed under the License is distributed on an \"AS IS\" BASIS,\n" +
        " WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" +
        " See the License for the specific language governing permissions and\n" +
        " limitations under the License.\n" +
        " */\n" +
        "'use strict';\n" +
        "\n" +
        "// TODO Change this to an appropriate privilege, or replace it with a line starting with \"// No privilege required: (reason)\"\n" +
        "xdmp.securityAssert(\"http://marklogic.com/data-hub/privileges/changeme\", \"execute\");\n" +
        "\n" +
        "// TODO Commonly needed library that can be removed if not needed \n" +
        "const httpUtils = require(\"/data-hub/5/impl/http-utils.sjs\");\n" +
        "\n" +
        "// TODO Replace this with the parameters declared in your API file \n" +
        "var paramName;\n" +
        "\n" +
        "// TODO For parameters of type jsonDocument, use this technique to obtain a JSON object to work with \n" +
        "var input = fn.head(xdmp.fromJSON(input));\n" +
        "\n" +
        "// TODO Implement your endpoint logic here and have the last line be what you want to return (if anything)";

    /**
     * User would specify service name and endpoint name.
     * If service doesn't yet exist, service.json is stubbed out.
     * Then endpoint sjs and api are stubbed out.
     * And might as well update the Java interface too.
     *
     * @param args
     */
    public static void main(String[] args) throws IOException {
        if (args.length != 2) {
            throw new IllegalArgumentException("Requires 2 arguments; first is service name, second is endpoint name");
        }

        String serviceName = args[0].trim();
        String endpointName = args[1].trim();

        if (serviceName.isEmpty()) {
            throw new IllegalArgumentException("Service name cannot be blank");
        }
        if (endpointName.isEmpty()) {
            throw new IllegalArgumentException("Endpoint name cannot be blank");
        }

        System.out.println("Generating Data services files for service '" + serviceName + "' and endpoint '" + endpointName + "'");

        File projectDir = new File("marklogic-data-hub");
        if (!projectDir.exists()) {
            projectDir = new File(".");
        }

        ObjectMapper mapper = new ObjectMapper();
        ObjectWriter writer = mapper.writerWithDefaultPrettyPrinter();

        final File modulesDir = new File(projectDir, "src/main/resources/ml-modules/root/data-hub/5/data-services");
        final File serviceDir = new File(modulesDir, serviceName);
        serviceDir.mkdirs();

        final File serviceFile = new File(serviceDir, "service.json");
        if (!serviceFile.exists()) {
            ObjectNode service = mapper.createObjectNode();
            service.put("desc", "This service description will be included in the class comments of the generated Java class");
            service.put("endpointDirectory", "/data-hub/5/data-services/" + serviceName + "/");
            service.put("$javaClass", "com.marklogic.hub.dataservices." + StringUtils.capitalize(serviceName) + "Service");
            System.out.println("Writing service file: " + serviceFile);
            writer.writeValue(serviceFile, service);
        } else {
            System.out.println("Service file already exists: " + serviceFile);
        }

        final File apiFile = new File(serviceDir, endpointName + ".api");
        if (!apiFile.exists()) {
            ObjectNode api = mapper.createObjectNode();
            api.put("functionName", endpointName);
            api.put("desc", "This endpoint description will be included in the method comments of the generated Java method");

            ArrayNode params = api.putArray("params");
            ObjectNode param = params.addObject();
            param.put("name", "paramName");
            param.put("datatype", "string");
            param.put("desc", "Change or remove this parameter. This description will be included in the method comments of the generated Java method.");
            System.out.println("Writing API file: " + apiFile);

            ObjectNode returnValue = api.putObject("return");
            returnValue.put("datatype", "jsonDocument");
            returnValue.put("$javaClass", "com.fasterxml.jackson.databind.JsonNode");
            returnValue.put("desc", "Change this return value as needed. This description will be included in the method comments of the generated Java class.");
            writer.writeValue(apiFile, api);
        } else {
            System.out.println("API file already exists: " + apiFile);
        }

        final File moduleFile = new File(serviceDir, endpointName + ".sjs");
        if (!moduleFile.exists()) {
            System.out.println("Writing module file: " + moduleFile);
            FileCopyUtils.copy(MODULE_TEMPLATE.getBytes(), moduleFile);
        } else {
            System.out.println("Module file already exists: " + moduleFile);
        }

        System.out.println("\nTo update the associated Java interface for this service, please run: ");
        System.out.println("\n./gradlew generate" + serviceName + "Service");
    }


}
