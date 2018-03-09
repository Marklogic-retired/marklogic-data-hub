/*
 * Copyright 2012-2018 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.scaffold;

import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.impl.ScaffoldingImpl;
import com.marklogic.client.DatabaseClient;

import java.io.File;
import java.nio.file.Path;
import java.util.List;

public interface Scaffolding {

    static Scaffolding create(String projectDir, DatabaseClient databaseClient) {
        return new ScaffoldingImpl(projectDir, databaseClient);
    }

    static String getAbsolutePath(String first, String... more) {
        StringBuilder absolutePath = new StringBuilder(first);
        for (String path : more) {
            absolutePath.append(File.separator);
            absolutePath.append(path);
        }
        return absolutePath.toString();
    }

    Path getFlowDir(String entityName, String flowName, FlowType flowType);

    void createEntity(String entityName);

    void createFlow(String entityName, String flowName,
                    FlowType flowType, CodeFormat codeFormat,
                    DataFormat dataFormat);

    void createFlow(String entityName, String flowName,
                    FlowType flowType, CodeFormat codeFormat,
                    DataFormat dataFormat, boolean useEsModel);

    List<String> updateLegacyFlows(String fromVersion, String entityName);

    void updateLegacyEntity(String entityName);

    boolean updateLegacyFlow(String fromVersion, String entityName, String flowName, FlowType flowType);

    void createRestExtension(String entityName, String extensionName,
                             FlowType flowType, CodeFormat codeFormat) throws ScaffoldingValidationException;

    void createRestTransform(String entityName, String transformName,
                             FlowType flowType, CodeFormat codeFormat) throws ScaffoldingValidationException;

    Path getEntityDir(String entityName);
}
