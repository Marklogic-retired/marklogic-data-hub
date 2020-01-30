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

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.impl.Versions;
import com.marklogic.hub.oneui.models.EnvironmentInfo;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.prefs.Preferences;

@Service
public class EnvironmentService {

    @Autowired
    private HubConfigSession hubConfig;

    @Autowired
    private Versions versions;

    @Autowired
    private EnvironmentConfig environmentConfig;

    private Preferences prefs = Preferences.userNodeForPackage(EnvironmentService.class);

    public EnvironmentService() {}

    public synchronized EnvironmentInfo getEnvironment() {
        EnvironmentInfo environment = null;
        byte[] bytes = prefs.getByteArray("environment", null);
        if (bytes != null) {
            try {
                environment = (EnvironmentInfo)bytes2Object(bytes);
            }
            catch(Exception e) {
            }
        }
        return environment;
    }

    public String getProjectDirectory() {
        return prefs.get("projectDirectory", System.getProperty("user.dir"));
    }

    public synchronized void reset() {
        prefs.remove("environment");
        prefs.remove("projectDirectory");
        hubConfig.createProject(getProjectDirectory());
    }

    public synchronized void setEnvironment(EnvironmentInfo environmentInfo) {
        try {
            prefs.putByteArray("environment", object2Bytes(environmentInfo));
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private byte[] object2Bytes( Object o ) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ObjectOutputStream oos = new ObjectOutputStream( baos );
        oos.writeObject( o );
        return baos.toByteArray();
    }

    private Object bytes2Object( byte raw[] ) throws IOException, ClassNotFoundException {
        ByteArrayInputStream bais = new ByteArrayInputStream( raw );
        ObjectInputStream ois = new ObjectInputStream( bais );
        return ois.readObject();
    }

    public void setProjectDirectory(String directory) {
        Path projectDirPath = Paths.get(System.getProperty("user.dir")).resolve(directory);
        prefs.put("projectDirectory", projectDirPath.toAbsolutePath().toString());
    }

    public JsonNode getProjectInfo() {
        environmentConfig.setProjectInfo();
        return environmentConfig.toJson();
    }
}
