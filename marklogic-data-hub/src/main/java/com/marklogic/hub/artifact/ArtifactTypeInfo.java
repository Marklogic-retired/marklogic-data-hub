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
package com.marklogic.hub.artifact;

/**
 * Provides metadata about an artifact type
 */
public class ArtifactTypeInfo {
    private String type;
    private String directory;
    private String fileExtension;
    private String versionProperty;
    private String nameProperty;
    private boolean userCanUpdate;
    private boolean userCanRead;

    public String getType() {
        return type;
    }

    public String getDirectory() {
        return directory;
    }

    public String getFileExtension() {
        return fileExtension;
    }

    public String getVersionProperty() {
        return versionProperty;
    }

    public String getNameProperty() {
        return nameProperty;
    }

    public boolean getUserCanUpdate() {
        return userCanUpdate;
    }

    public boolean getUserCanRead() {
        return userCanRead;
    }
}
