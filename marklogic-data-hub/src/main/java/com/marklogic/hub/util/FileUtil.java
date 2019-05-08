/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.util;

import org.apache.commons.io.FileUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class FileUtil {

    public static void copy(InputStream source, File destination) {
        try {
            FileUtils.copyInputStreamToFile(source, destination);
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static List<String> listDirectFolders(File rootDirectory) {
        List<String> folders = new ArrayList<>();
        if (rootDirectory.exists() && rootDirectory.isDirectory()) {
            File[] files = rootDirectory.listFiles();
            for (File file : files) {
                if (file.isDirectory() && !file.isHidden()) {
                    folders.add(file.getName());
                }
            }
        }
        Collections.sort(folders);
        return folders;
    }
    public static List<String> listDirectFolders(String rootDirectoryName) {
        return listDirectFolders(new File(rootDirectoryName));
    }
    public static List<String> listDirectFolders(Path rootDirectoryPath) {
        return listDirectFolders(rootDirectoryPath.toFile());
    }

    public static List<String> listDirectFiles(File rootDirectory) {
        List<String> filenames = new ArrayList<>();
        if (rootDirectory.exists() && rootDirectory.isDirectory()) {
            File[] files = rootDirectory.listFiles();
            for (File file : files) {
                if (!file.isDirectory() && !file.isHidden()) {
                    filenames.add(file.getName());
                }
            }
        }
        Collections.sort(filenames);
        return filenames;
    }
    public static List<String> listDirectFiles(String rootDirectoryName) {
        return listDirectFiles(new File(rootDirectoryName));
    }
    public static List<String> listDirectFiles(Path rootDirectoryPath) {
        return listDirectFiles(rootDirectoryPath.toFile());
    }
}
