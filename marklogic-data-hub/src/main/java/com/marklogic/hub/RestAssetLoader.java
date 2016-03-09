/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub;

import java.io.File;
import java.io.FileFilter;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.FileVisitor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import org.apache.commons.io.FilenameUtils;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.Transaction;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.modulesloader.ModulesManager;
import com.marklogic.client.modulesloader.impl.AssetFileFilter;

/**
 * Handles loading assets - as defined by the REST API, which are under the /ext directory - via REST.
 * Currently not a threadsafe class - in order to make it threadsafe, would need to move the impl of FileVisitor to a
 * separate class.
 */
public class RestAssetLoader extends LoggingObject implements FileVisitor<Path> {

    private DatabaseClient client;

    // Controls what files/directories are processed
    private FileFilter fileFilter = new AssetFileFilter();

    // State that is maintained while visiting each asset path. Would need to move this to another class if this
    // class ever needs to be thread-safe.
    private Path currentAssetPath;
    private Path currentRootPath;
    private Set<File> filesLoaded;
    private Transaction currentTransaction = null;

    private ModulesManager modulesManager;

    public RestAssetLoader(DatabaseClient client) {
        this.client = client;
    }

    /**
     * For walking one or many paths and loading modules in each of them.
     */
    public Set<File> loadAssetsViaREST(String... paths) {
        currentTransaction = client.openTransaction();
        filesLoaded = new HashSet<>();
        try {
            for (String path : paths) {
                if (logger.isDebugEnabled()) {
                    logger.debug(format("Loading assets from path: %s", path));
                }
                this.currentAssetPath = Paths.get(path);
                this.currentRootPath = this.currentAssetPath;
                try {
                    Files.walkFileTree(this.currentAssetPath, this);
                } catch (IOException ie) {
                    throw new RuntimeException(format("Error while walking assets file tree: %s", ie.getMessage()), ie);
                }
            }
            currentTransaction.commit();
        }
        catch(Exception e) {
            currentTransaction.rollback();
        }
        return filesLoaded;
    }

    /**
     * FileVisitor method that determines if we should visit the directory or not via the fileFilter.
     */
    @Override
    public FileVisitResult preVisitDirectory(Path path, BasicFileAttributes attributes) throws IOException {
        logger.info("filename: " + path.toFile().getName());
        boolean accept = fileFilter.accept(path.toFile());
        if (accept) {
            if (logger.isDebugEnabled()) {
                logger.debug("Visiting directory: " + path);
            }
            return FileVisitResult.CONTINUE;
        }
        else {
            if (logger.isDebugEnabled()) {
                logger.debug("Skipping directory: " + path);
            }
            return FileVisitResult.SKIP_SUBTREE;
        }
    }

    /**
     * FileVisitor method that loads the file into the modules database if the fileFilter accepts it.
     */
    @Override
    public FileVisitResult visitFile(Path path, BasicFileAttributes attributes) throws IOException {
        if (fileFilter.accept(path.toFile())) {
            Path relPath = currentAssetPath.relativize(path);
            String uri = "/" + relPath.toString().replace("\\", "/");
            if (this.currentRootPath != null) {
                String name = this.currentRootPath.toFile().getName();
                // A bit of a hack to support the special "root" directory.
                if (!"root".equals(name)) {
                    uri = "/" + name + uri;
                }
            }
            uri = "/ext" + uri;
            loadFile(uri, path.toFile());
            filesLoaded.add(path.toFile());
        }
        return FileVisitResult.CONTINUE;
    }

    /**
     * Does the actual work of loading a file into the modules database via REST.
     *
     * @param uri
     * @param f
     */
    protected void loadFile(String uri, File f) {
        if (modulesManager != null && !modulesManager.hasFileBeenModifiedSinceLastInstalled(f)) {
            return;
        }

        FileHandle handle = new FileHandle(f);

        String ext = FilenameUtils.getExtension(f.getName());
        switch(ext) {
        case "xml":
            handle.setFormat(Format.XML);
            break;
        case "json":
            handle.setFormat(Format.JSON);
            break;
        default:
            handle.setFormat(Format.TEXT);
        }

        client.newDocumentManager().write(uri, handle, currentTransaction);

        if (modulesManager != null) {
            modulesManager.saveLastInstalledTimestamp(f, new Date());
        }
    }

    @Override
    public FileVisitResult postVisitDirectory(Path path, IOException exception) throws IOException {
        return FileVisitResult.CONTINUE;
    }

    @Override
    public FileVisitResult visitFileFailed(Path path, IOException exception) throws IOException {
        return FileVisitResult.CONTINUE;
    }

    public void setModulesManager(ModulesManager modulesManager) {
        this.modulesManager = modulesManager;
    }
}
