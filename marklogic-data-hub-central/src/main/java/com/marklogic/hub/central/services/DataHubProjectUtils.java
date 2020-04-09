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
package com.marklogic.hub.central.services;

import com.marklogic.hub.HubProject;
import com.marklogic.hub.central.listener.UIDeployListener;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;

public class DataHubProjectUtils {
    protected static final Logger logger = LoggerFactory.getLogger(DataHubProjectUtils.class);

    /**
     *
     * @param project
     * @param in
     * @param listener
     */
    public static void replaceProject(HubProject project, InputStream in, UIDeployListener listener) {
        // backup first
        backupExistingFSProject(project, listener);

        // delete contents from the current project folder
        cleanExistingFSProject(project, listener);

        // convert to byte array input stream if necessary
        InputStream bin = toByteArrayInputStream(in);

        // extract the uploaded & zipped project file into the current project folder
        extractZipProject(project, bin, listener);
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
     * @param in
     * @param listener
     */
    public static void extractZipProject(HubProject project, InputStream in, UIDeployListener listener) {
        Path currProjectDir = project.getProjectDir();
        listener.onStatusChange(0, String.format("Extracting the uploaded zip project into (%s)", currProjectDir.toFile().getAbsolutePath()));

        //deal with a zip file that has or does not have an extra archive folder,
        //if there is an extra archive folder in the zip, ignore creating the folder so that the new project-related folder structure is extracted into the current project folder
        //we guarantee the new project is extracted into the current project folder with introducing a new archive folder
        //also the existing folder and name are intact.
        String currFolderName =  currProjectDir.toFile().getAbsolutePath();
        String archiveFolder = getArchiveFolderOfZipFile(currFolderName, in);

        try (BufferedInputStream bis = new BufferedInputStream(in);
             ZipInputStream stream = new ZipInputStream(bis)) {
            ZipEntry entry;
            while ((entry = stream.getNextEntry()) != null) {
                String entryName = entry.getName();
                if (entryName.startsWith("__MACOSX")) { //mac os special folder
                    continue;
                }
                Path filePath = null;
                if (StringUtils.isEmpty(archiveFolder)) {
                    filePath = currProjectDir.resolve(entryName);
                } else {
                    if (!entryName.startsWith(archiveFolder) || entryName.length() <= archiveFolder.length() + 1) {
                        continue;
                    }
                    String childPath = entryName.substring(archiveFolder.length() + 1);
                    filePath = currProjectDir.resolve(childPath);
                }
                if (entry.isDirectory()) {
                    if (!Files.exists(filePath)) {
                        Files.createDirectories(filePath);
                    }
                } else {
                    byte[] buffer = new byte[2048];
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

    /**
     * convert input stream to byte array input stream if necessary
     * @param in
     * @return
     */
    protected static InputStream toByteArrayInputStream(InputStream in) {
        if (in instanceof ByteArrayInputStream) {
            return in;
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            FileCopyUtils.copy(in, out);
        } catch (IOException e) {
            throw new RuntimeException(String.format("Failed to convert to ByteArrayInputStream due to (%s)", e.getMessage()));
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    /**
     * get the archive folder if existed, otherwise return null
     *
     * @param currFolderName
     * @param in
     * @return
     */
    protected static String getArchiveFolderOfZipFile(String currFolderName, InputStream in) {
        Set<String> topLevelPaths = new HashSet<>();
        try (BufferedInputStream bis = new BufferedInputStream(in);
             ZipInputStream stream = new ZipInputStream(bis)) {
            ZipEntry entry;
            while ((entry = stream.getNextEntry()) != null) {
                String entryName = entry.getName();
                String topPath = FilenameUtils.getPathNoEndSeparator(entryName);
                String topFileName  = FilenameUtils.getName(entryName);
                if (topPath.startsWith("__MACOSX")) {
                    continue;
                }
                if (!topPath.contains(File.separator)) {
                    if (StringUtils.isNotEmpty(topPath)) {
                        topLevelPaths.add(topPath);
                    } else if (StringUtils.isNotEmpty(topFileName) && !topFileName.contains(File.separator))  {
                        topLevelPaths.add(topFileName);
                    }
                    if (topLevelPaths.size() > 1) {
                        break;
                    }
                }
            }
            in.reset();
        } catch (IOException e) {
            throw new RuntimeException(
                String.format("Failed to extract the uploaded zip project into (%s) due to (%s).", currFolderName, e.getMessage()));
        }
        if (topLevelPaths.isEmpty()) {
            String errorMsg = String.format("Failed to extract the uploaded zip project into (%s) due to (%s).", currFolderName, "invalid zipped project file");
            logger.error(errorMsg);
            throw new RuntimeException(errorMsg);
        }
        if (topLevelPaths.size() == 1)   {
            //entry is the archive folder
            return topLevelPaths.iterator().next();
        }
        return null;
    }
}
