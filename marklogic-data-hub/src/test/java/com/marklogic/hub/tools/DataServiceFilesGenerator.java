package com.marklogic.hub.tools;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;

/**
 * For each data-services file under specs, generate the service.json file, plus .api/.sjs files for each
 * endpoint, in the appropriate modules directory in this project.
 */
public class DataServiceFilesGenerator extends LoggingObject {

    private ObjectMapper mapper;
    private File specsDir;
    private File projectDir;

    public static void main(String[] args) throws Exception {
        File specsDir = new File("specs");
        File projectDir = new File("marklogic-data-hub");
        if (!specsDir.exists()) {
            specsDir = new File("../specs");
            projectDir = new File(".");
        }

        new DataServiceFilesGenerator(specsDir, projectDir).processDataServiceFiles();
    }

    public DataServiceFilesGenerator(File specsDir, File projectDir) {
        this.mapper = ObjectMapperFactory.getObjectMapper();
        this.specsDir = specsDir;
        this.projectDir = projectDir;
    }

    public void processDataServiceFiles() throws Exception {
        final File dataServicesDir = new File(specsDir, "reference/data-services");
        for (File file : dataServicesDir.listFiles(pathname -> pathname.getName().endsWith("json"))) {
            if (!"models.v1.json".equals(file.getName())) {
                continue;
            }
            logger.info("Processing file: " + file);

            final ObjectNode spec = (ObjectNode) mapper.readTree(file);
            final String serviceName = spec.get("info").get("title").asText();
            final File serviceDir = writeServiceFile(serviceName);

            spec.get("paths").fieldNames().forEachRemaining(pathName -> {
                final String functionName = pathName.substring(1).replace(".sjs", "");
                final String filename = pathName.substring(1).replace(".sjs", ".api");

                final JsonNode path = spec.get("paths").get(pathName);
                final JsonNode httpMethodNode = path.get(path.fieldNames().next());

                final Pair<ObjectNode, String> apiAndModuleText = buildApi(functionName, httpMethodNode);

                final File apiFile = new File(serviceDir, filename);
                final File moduleFile = new File(serviceDir, pathName.substring(1));
                try {
                    mapper.writeValue(apiFile, apiAndModuleText.getLeft());
                    logger.info("Wrote API file: " + apiFile);
                    if (!moduleFile.exists()) {
                        FileCopyUtils.copy(apiAndModuleText.getRight().getBytes(), moduleFile);
                        logger.info("Wrote module file: " + moduleFile);
                    }
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
        }
    }

    private File writeServiceFile(String serviceName) throws Exception {
        final File modulesDir = new File(projectDir, "src/main/resources/ml-modules/root/data-hub/5/data-services");
        final File serviceDir = new File(modulesDir, serviceName);
        serviceDir.mkdirs();

        ObjectNode serviceNode = mapper.createObjectNode();
        serviceNode.put("endpointDirectory", "/data-hub/5/data-services/" + serviceName + "/");
        serviceNode.put("$javaClass", "com.marklogic.hub.dataservices." + StringUtils.capitalize(serviceName) + "Service");
        mapper.writeValue(new File(serviceDir, "service.json"), serviceNode);

        return serviceDir;
    }

    private Pair<ObjectNode, String> buildApi(String functionName, JsonNode httpMethodNode) {
        ObjectNode api = mapper.createObjectNode();
        api.put("functionName", functionName);
        if (httpMethodNode.has("description")) {
            api.put("desc", httpMethodNode.get("description").asText());
        }

        String moduleText = MODULE_TEXT;

        if (httpMethodNode.has("parameters")) {
            ArrayNode params = api.putArray("params");
            ArrayNode parameters = (ArrayNode)httpMethodNode.get("parameters");
            parameters.forEach(param -> {
                final String name = param.get("name").asText();
                final String type = param.get("schema").get("type").asText();
                ObjectNode node = params.addObject();
                node.put("name", name);
                node.put("datatype", type);
                if (param.has("description")) {
                    node.put("desc", param.get("description").asText());
                }
            });
        }

        if (httpMethodNode.has("requestBody")
            && httpMethodNode.get("requestBody").has("content")
            && httpMethodNode.get("requestBody").get("content").has("application/json")) {
            addRequestBodyAsParam(api, httpMethodNode);
            moduleText += INPUT_TEXT;
        }

        addReturnNode(api, httpMethodNode);

        return Pair.of(api, moduleText);
    }


    private void addRequestBodyAsParam(ObjectNode api, JsonNode httpMethodNode) {
        ArrayNode params = api.has("params") ? (ArrayNode)api.get("params") : api.putArray("params");
        ObjectNode param = params.addObject();
        param.put("name", "input");
        param.put("datatype", "jsonDocument");
        param.put("$javaClass", "com.fasterxml.jackson.databind.JsonNode");

        // DS doesn't support a "schema", but it won't complain about it either. So if it's in the OpenAPI
        // spec, copy it over so that the API file is more useful.
        JsonNode typeNode = httpMethodNode.get("requestBody").get("content").get("application/json");
        if (typeNode.has("schema")) {
            ObjectNode schema = (ObjectNode) typeNode.get("schema");
            param.set("schema", schema.deepCopy());
        }
    }

    private void addReturnNode(ObjectNode api, JsonNode httpMethodNode) {
        final JsonNode responses = httpMethodNode.get("responses");
        JsonNode successResponse = null;
        if (responses.has("200")) {
            successResponse = responses.get("200");
        } else if (responses.has("201")) {
            successResponse = responses.get("201");
        }
        if (successResponse != null) {
            if (successResponse.has("content") && successResponse.get("content").has("application/json")) {
                ObjectNode returnNode = api.putObject("return");
                returnNode.put("datatype", "jsonDocument");
                returnNode.put("$javaClass", "com.fasterxml.jackson.databind.JsonNode");
            }
        }
    }

    private final static String MODULE_TEXT = "/*\n" +
        "  Copyright 2012-2019 MarkLogic Corporation\n" +
        "\n" +
        "  Licensed under the Apache License, Version 2.0 (the \"License\");\n" +
        "  you may not use this file except in compliance with the License.\n" +
        "  You may obtain a copy of the License at\n" +
        "\n" +
        "     http://www.apache.org/licenses/LICENSE-2.0\n" +
        "\n" +
        "  Unless required by applicable law or agreed to in writing, software\n" +
        "  distributed under the License is distributed on an \"AS IS\" BASIS,\n" +
        "  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" +
        "  See the License for the specific language governing permissions and\n" +
        "  limitations under the License.\n" +
        "*/\n" +
        "'use strict';";

    private final static String INPUT_TEXT = "\nvar input = fn.head(xdmp.fromJSON(input));" +
        "\nconsole.log('input', input);" +
        "\ninput";
}
