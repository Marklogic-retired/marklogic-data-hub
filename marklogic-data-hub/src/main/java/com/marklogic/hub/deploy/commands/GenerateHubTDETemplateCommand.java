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
package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.es.GenerateModelArtifactsCommand;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.es.CodeGenerationRequest;
import com.marklogic.client.ext.es.EntityServicesManager;
import com.marklogic.client.ext.es.GeneratedCode;
import com.marklogic.hub.HubConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.nio.file.Path;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import static java.util.stream.Collectors.*;


public class GenerateHubTDETemplateCommand extends GenerateModelArtifactsCommand {
    private static final String ENTITY_FILE_EXTENSION = ".entity.json";
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    private HubConfig hubConfig;

    private String entityNames;

    public GenerateHubTDETemplateCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public void execute(CommandContext context) {
        AppConfig appConfig = context.getAppConfig();
        DatabaseClient client = appConfig.newDatabaseClient();
        EntityServicesManager mgr = new EntityServicesManager(client);

        CodeGenerationRequest request = createCodeGenerationRequest();

        List<File> entityFiles  = findEntityFiles();

        if (!entityFiles.isEmpty()) {
            //create map of entity name -> entity definition file
            Map<String,File> entityNameFileMap = createEntityNameFileMap(entityFiles);

            logger.debug("Found the following entities->files: {} " + entityNameFileMap);

            filterEntities(entityNameFileMap);

            if (!entityNameFileMap.isEmpty()) {
                logger.warn("About to generate a template for the following entities: {} into directory {} ",
                    entityNameFileMap.keySet(), hubConfig.getAppConfig().getSchemasPath());

                for (File f : entityNameFileMap.values()) {
                    GeneratedCode code = loadModelDefinition(request, f, mgr);
                    generateExtractionTemplate(appConfig, code);
                }

            }

        } else {
            logger.info("No data hub entity files found under {} or its sub-directories.",
                hubConfig.getHubEntitiesDir());
        }

    }

    public String getEntityNames() {
        return entityNames;
    }

    public void setEntityNames(String entityNames) {
        this.entityNames = entityNames;
    }

    protected void filterEntities(Map<String,File> entityNameFileMap) {
        Set<String> entityNameFileMapKeys = entityNameFileMap.keySet();

        //filter on entityNames parameter if specified
        if (entityNames!=null&&!entityNames.isEmpty()) {
            List<String> entityNamesAsList = Arrays.asList(entityNames.split(","));
            logger.info("Entities specified for TDE Generation: {} " + entityNamesAsList);

            //this will only keep keys in the map that are also in the entityNamesAsList
            entityNameFileMapKeys.retainAll(entityNamesAsList);

            if (entityNameFileMapKeys.isEmpty()) {
                logger.warn("No entities files found under {} or its sub-directories with the entity name(s) {}", hubConfig.getHubEntitiesDir(),entityNamesAsList);
            }
        }
    }

    protected static Map<String,File> createEntityNameFileMap(List<File> entityFiles) {
        if (entityFiles==null) {
            return Collections.emptyMap();
        }
        return entityFiles.stream().collect(
            toMap(extractEntityNameFunction(),Function.identity()));
    }

    protected List<File> findEntityFiles() {
        List<File> entities = new ArrayList<>();
        Path entitiesPath = hubConfig.getHubEntitiesDir();
        File[] entityDirectories = entitiesPath.toFile().listFiles(pathname -> pathname.isDirectory() && !pathname.isHidden());
        List<String> entityNames;
        if (entityDirectories != null) {
            entityNames = Arrays.stream(entityDirectories)
                .map(file -> file.getName())
                .collect(Collectors.toList());
            for (String entityName : entityNames) {
                File[] entityDefs = entitiesPath.resolve(entityName).toFile().listFiles((dir, name) -> name.endsWith(ENTITY_FILE_EXTENSION));
                if (entityDefs!=null) {
                    entities.addAll(Arrays.asList(entityDefs));
                }
            }
        }
        return entities;
    }

    protected static Optional<String> extactEntityNameFromFilename(String filename) {
        if (filename==null || filename.trim().isEmpty()) {
            return Optional.of(null);
        }
        int index = filename.indexOf(ENTITY_FILE_EXTENSION);
        if (index<0) {
            //not found
            return Optional.of(null);
        }
        return Optional.of(filename.substring(0,index));
    }

    private static Function<File, String> extractEntityNameFunction() {
        Function<File, String> fileName = File::getName;
        return fileName.andThen(name -> extactEntityNameFromFilename(name).get());
    }

    private static final CodeGenerationRequest createCodeGenerationRequest() {
        CodeGenerationRequest request = new CodeGenerationRequest();
        request.setGenerateExtractionTemplate(true);
        request.setGenerateDatabaseProperties(false);
        request.setGenerateInstanceConverter(false);
        request.setGenerateSchema(false);
        request.setGenerateSearchOptions(false);
        return request;
    }
}
