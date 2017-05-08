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
package com.marklogic.quickstart.util;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class FileUtil {

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
        return folders;
    }

    public static List<String> listDirectFiles(String path) {
        List<String> filenames = new ArrayList<>();
        File rootDirectory = new File(path);
        if (rootDirectory.exists() && rootDirectory.isDirectory()) {
            File[] files = rootDirectory.listFiles();
            for (File file : files) {
                if (!file.isDirectory() && !file.isHidden()) {
                    filenames.add(file.getName());
                }
            }
        }
        return filenames;
    }
}
