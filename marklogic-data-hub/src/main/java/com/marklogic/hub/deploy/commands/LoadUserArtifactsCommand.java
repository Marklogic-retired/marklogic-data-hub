/*
 * copyright 2012-2019 MarkLogic Corporation
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
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.impl.EntityDefModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.MappingDefModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubConfig;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Date;
import java.util.regex.Pattern;

/**
 * Loads user artifacts like mappings and entities. This will be deployed after triggers
 */
@Component
public class LoadUserArtifactsCommand extends AbstractCommand {

    @Autowired
    private HubConfig hubConfig;

    private DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();

    public void setForceLoad(boolean forceLoad) {
        this.forceLoad = forceLoad;
    }

    private boolean forceLoad = false;

    public LoadUserArtifactsCommand() {
        super();
        setExecuteSortOrder(SortOrderConstants.DEPLOY_TRIGGERS + 1);
    }

    boolean isArtifactDir(Path dir, Path startPath) {
        String dirStr = dir.toString();
        String startPathStr = Pattern.quote(startPath.toString());
        String regex = startPathStr + "[/\\\\][^/\\\\]+$";
        return dirStr.matches(regex);
    }

    private PropertiesModuleManager getModulesManager() {
        String timestampFile = hubConfig.getHubProject().getUserModulesDeployTimestampFile();
        PropertiesModuleManager pmm = new PropertiesModuleManager(timestampFile);

        // Need to delete ml-javaclient-utils timestamp file as well as modules present in the standard gradle locations are now
        // loaded by the modules loader in the parent class which adds these entries to the ml-javaclient-utils timestamp file
        String filePath = hubConfig.getAppConfig().getModuleTimestampsPath();
        File defaultTimestampFile = new File(filePath);

        if (forceLoad) {
            pmm.deletePropertiesFile();
            if (defaultTimestampFile.exists()) {
                if (!defaultTimestampFile.delete()) {
                    logger.warn("Unable to delete properties file: {}", defaultTimestampFile.getAbsolutePath());
                }
            }
        }
        return pmm;
    }

    @Override
    public void execute(CommandContext context) {
        AppConfig config = context.getAppConfig();

        DatabaseClient stagingClient = hubConfig.newStagingClient();
        DatabaseClient finalClient = hubConfig.newFinalClient();

        Path userModulesPath = hubConfig.getHubPluginsDir();
        Path startPath = userModulesPath.resolve("entities");
        Path mappingPath = userModulesPath.resolve("mappings");

        JSONDocumentManager finalDocMgr = finalClient.newJSONDocumentManager();
        JSONDocumentManager stagingDocMgr = stagingClient.newJSONDocumentManager();

        DocumentWriteSet finalEntityDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingEntityDocumentWriteSet = stagingDocMgr.newWriteSet();
        DocumentWriteSet finalMappingDocumentWriteSet = finalDocMgr.newWriteSet();
        DocumentWriteSet stagingMappingDocumentWriteSet = stagingDocMgr.newWriteSet();
        PropertiesModuleManager propertiesModuleManager = getModulesManager();

        try {
            if (startPath.toFile().exists()) {
                //first let's do the entities
                Files.walkFileTree(startPath, new SimpleFileVisitor<Path>() {
                    @Override
                    public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                        if (isArtifactDir(dir, startPath.toAbsolutePath())) {
                            Modules modules = new EntityDefModulesFinder().findModules(dir.toString());
                            DocumentMetadataHandle meta = new DocumentMetadataHandle();
                            meta.getCollections().add("http://marklogic.com/entity-services/models");
                            documentPermissionsParser.parsePermissions(hubConfig.getModulePermissions(), meta.getPermissions());
                            for (Resource r : modules.getAssets()) {
                                if (forceLoad || propertiesModuleManager.hasFileBeenModifiedSinceLastLoaded(r.getFile())) {
                                    InputStream inputStream = r.getInputStream();
                                    StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                                    inputStream.close();
                                    finalEntityDocumentWriteSet.add("/entities/" + r.getFilename(), meta, handle);
                                    stagingEntityDocumentWriteSet.add("/entities/" + r.getFilename(), meta, handle);
                                    propertiesModuleManager.saveLastLoadedTimestamp(r.getFile(), new Date());
                                }
                            }
                            return FileVisitResult.CONTINUE;
                        } else {
                            return FileVisitResult.CONTINUE;
                        }
                    }
                });

                //now let's do the mappings path
                if (mappingPath.toFile().exists()) {
                    Files.walkFileTree(mappingPath, new SimpleFileVisitor<Path>() {
                        @Override
                        public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                            String currentDir = dir.normalize().toAbsolutePath().toString();

                            if (isArtifactDir(dir, mappingPath.toAbsolutePath())) {
                                Modules modules = new MappingDefModulesFinder().findModules(dir.toString());
                                DocumentMetadataHandle meta = new DocumentMetadataHandle();
                                meta.getCollections().add("http://marklogic.com/data-hub/mappings");
                                documentPermissionsParser.parsePermissions(hubConfig.getModulePermissions(), meta.getPermissions());
                                for (Resource r : modules.getAssets()) {
                                    if (forceLoad || propertiesModuleManager.hasFileBeenModifiedSinceLastLoaded(r.getFile())) {
                                        try (InputStream inputStream = r.getInputStream()) {
                                            StringHandle handle = new StringHandle(IOUtils.toString(inputStream));
                                            File parentFile = r.getFile().getParentFile();
                                            if (parentFile == null) {
                                                throw new RuntimeException("Unable to get parent file for resource: " + r.getFilename());
                                            }
                                            finalMappingDocumentWriteSet.add("/mappings/" + parentFile.getName() + "/" + r.getFilename(), meta, handle);
                                            stagingMappingDocumentWriteSet.add("/mappings/" + parentFile.getName() + "/" + r.getFilename(), meta, handle);
                                            propertiesModuleManager.saveLastLoadedTimestamp(r.getFile(), new Date());
                                        }
                                    }
                                }
                                return FileVisitResult.CONTINUE;
                            } else {
                                return FileVisitResult.CONTINUE;
                            }
                        }
                    });
                }
                if (stagingEntityDocumentWriteSet.size() > 0) {
                    finalDocMgr.write(finalEntityDocumentWriteSet);
                    stagingDocMgr.write(stagingEntityDocumentWriteSet);
                }
                if (stagingMappingDocumentWriteSet.size() > 0) {
                    finalDocMgr.write(finalMappingDocumentWriteSet);
                    stagingDocMgr.write(stagingMappingDocumentWriteSet);
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
            //throw new RuntimeException(e);
        }
    }

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

}
