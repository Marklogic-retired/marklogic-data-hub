package com.marklogic.hub.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.FileVisitor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.springframework.web.context.WebApplicationContext;

import com.marklogic.client.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.hub.config.EnvironmentConfiguration;

@Service
@Scope(scopeName=WebApplicationContext.SCOPE_SESSION)
public class SyncStatusService  implements InitializingBean {

    @Autowired
    private EnvironmentConfiguration environmentConfiguration;

    private PropertiesModuleManager moduleManager;

    @Override
    public void afterPropertiesSet() throws Exception {
        File assetInstallTimeFile = new File(environmentConfiguration.getAssetInstallTimeFilePath());
        moduleManager = new PropertiesModuleManager(assetInstallTimeFile);
    }

    /**
     * A file is synched if it has been previously installed, still exists and
     * the file's last modified timestamp is not past the last install time.
     *
     * @param file
     * @return
     * @throws IOException
     */
    private boolean isSynched(File file) throws IOException {
        return !this.moduleManager.hasFileBeenModifiedSinceLastInstalled(file);
    }


    public boolean isDirectorySynched(String absolutePath) {
        moduleManager.initialize();
        boolean synched = false;
        try {
            PluginDirectoryVisitor visitor = new PluginDirectoryVisitor();
            Files.walkFileTree(new File(absolutePath).toPath(), visitor);
            
            synched = visitor.isSynched();
        } catch (IOException e) {
            synched = false;
        }

        return synched;
    }

    private class PluginDirectoryVisitor implements FileVisitor<Path> {
        private boolean synched = true;
        
        public boolean isSynched() {
            return synched;
        }
        
        @Override
        public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
            return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
            // don't look at hidden files like .DS_Store
            if (!file.getFileName().toString().startsWith(".") && !file.toAbsolutePath().toString().contains("metadata")) {
                synched = synched && SyncStatusService.this.isSynched(file.normalize().toAbsolutePath().toFile());
                if (!synched) {
                    return FileVisitResult.TERMINATE;
                }
            }

            return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult visitFileFailed(Path file, IOException exc) throws IOException {
            return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
            return FileVisitResult.CONTINUE;
        }

    }
}
