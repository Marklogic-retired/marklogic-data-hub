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
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.FileCopyUtils;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class DataHubProjectUtils {
    protected static final Logger logger = LoggerFactory.getLogger(DataHubProjectUtils.class);

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
        String currFolderName = currProjectDir.toFile().getAbsolutePath();
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
     *
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
                String topFileName = FilenameUtils.getName(entryName);
                if (topPath.startsWith("__MACOSX")) {
                    continue;
                }
                if (!topPath.contains(File.separator)) {
                    if (StringUtils.isNotEmpty(topPath)) {
                        topLevelPaths.add(topPath);
                    } else if (StringUtils.isNotEmpty(topFileName) && !topFileName.contains(File.separator)) {
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
        if (topLevelPaths.size() == 1) {
            //entry is the archive folder
            return topLevelPaths.iterator().next();
        }
        return null;
    }
}
