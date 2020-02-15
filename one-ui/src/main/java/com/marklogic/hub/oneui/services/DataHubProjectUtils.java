/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.oneui.services;

import com.marklogic.hub.HubProject;
import com.marklogic.hub.oneui.listener.UIDeployListener;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

public class DataHubProjectUtils {
    protected static final Logger logger = LoggerFactory.getLogger(DataHubProjectUtils.class);

    /**
     *
     * @param project
     * @param uploadedFile
     * @param listener
     */
    public static void replaceFSProject(HubProject project, MultipartFile uploadedFile, UIDeployListener listener) {
        //backup first
        backupExistingFSProject(project, listener);

        // delete contents from the current project folder
        cleanExistingFSProject(project, listener);

        // extract the uploaded & zipped project file into the current project folder
        extractZipProject(project, uploadedFile, listener);

    }
    /**
     * backup existing server-side project folder structure into a zip file
     *
     * @param project
     * @param listener
     */
    public static void backupExistingFSProject(HubProject project, UIDeployListener listener) {
        listener.onStatusChange(0, String.format("Backing up the existing project (%s)", project.getProjectName()));
        File backupPath = new File(FilenameUtils.concat(FileUtils.getTempDirectoryPath(), "datahub-project"));

        if (!backupPath.exists()) {
            try {
                FileUtils.forceMkdir(backupPath);
            } catch (IOException e) {
                throw new RuntimeException(String.format("Failed to create a backup folder (%s) due to (%s).", backupPath, e.getMessage()));
            }
        }

        File backupFile = new File(FilenameUtils.concat(backupPath.toString(), project.getProjectName() + ".zip"));
        try (OutputStream out = new FileOutputStream(backupFile)) {
            project.exportProject(out);
            logger.info(String.format("Backed up the existing project to %s", backupFile.getAbsolutePath()));
        } catch (IOException e) {
            throw new RuntimeException(
                String.format("Failed to back up the existing project into (%s) due to (%s).", backupFile.getAbsolutePath(),
                    e.getMessage()));
        }
        listener.onStatusChange(0, String.format("Completed backing up the existing project (%s)", project.getProjectName()));
    }

    /**
     * clean contents of the existing server-side project folder
     *
     * @param project
     * @param listener
     */
    public static void cleanExistingFSProject(HubProject project, UIDeployListener listener) {
        Path currProjectDir = project.getProjectDir();
        listener.onStatusChange(0, String.format("Cleaning the existing project folder (%s)", currProjectDir.toFile().getAbsolutePath()));
        try {
            FileUtils.cleanDirectory(currProjectDir.toFile());
            logger.info(String.format("Cleaned the existing project folder (%s)", currProjectDir.toFile().getAbsolutePath()));
        } catch (IOException e) {
            throw new RuntimeException(
                String.format("Failed to clean the existing project folder (%s) due to (%s).", currProjectDir.toFile().getAbsolutePath(), e.getMessage()));
        }
        listener.onStatusChange(0, String.format("Completed cleaning the existing project folder (%s)", currProjectDir.toFile().getAbsolutePath()));
    }

    /**
     * extract uploaded zip file into the server-side project folder
     *
     * @param project
     * @param uploadedFile
     * @param listener
     */
    public static void extractZipProject(HubProject project, MultipartFile uploadedFile, UIDeployListener listener) {
        Path currProjectDir = project.getProjectDir();
        listener.onStatusChange(0, String.format("Extracting the uploaded zip project into (%s)", currProjectDir.toFile().getAbsolutePath()));
        byte[] buffer = new byte[2048];
        try (InputStream in = uploadedFile.getInputStream();
             BufferedInputStream bis = new BufferedInputStream(in);
             ZipInputStream stream = new ZipInputStream(bis)) {
            ZipEntry entry;
            while ((entry = stream.getNextEntry()) != null) {
                Path filePath = currProjectDir.resolve(entry.getName());
                if (entry.isDirectory()) {
                    if (!Files.exists(filePath)) {
                        Files.createDirectories(filePath);
                    }
                } else {
                    try (FileOutputStream fos = new FileOutputStream(filePath.toFile());
                         BufferedOutputStream bos = new BufferedOutputStream(fos, buffer.length)) {

                        int len;
                        while ((len = stream.read(buffer)) > 0) {
                            bos.write(buffer, 0, len);
                        }
                    }
                }
            }
            logger.info(String.format("Extracted the uploaded zip project into (%s)", currProjectDir.toFile().getAbsolutePath()));
        } catch (IOException e) {
            throw new RuntimeException(
                String.format("Failed to extract the uploaded zip project into (%s) due to (%s).", currProjectDir.toFile().getAbsolutePath(), e.getMessage()));
        }
        listener.onStatusChange(0, String.format("Completed extracting the uploaded zip project into (%s)", currProjectDir.toFile().getAbsolutePath()));
    }
}
