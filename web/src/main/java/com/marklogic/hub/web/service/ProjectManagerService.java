/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web.service;

import com.marklogic.hub.web.exception.BadRequestException;
import com.marklogic.hub.web.exception.NotFoundException;
import com.marklogic.hub.web.model.Project;
import com.marklogic.hub.web.model.ProjectInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.prefs.Preferences;

@Service
public class ProjectManagerService {

    private Preferences prefs = Preferences.userNodeForPackage(ProjectManagerService.class);
    private int maxId = 0;

    @Autowired
    private Project project;

    public ProjectManagerService() {}

    public Map<Integer, ProjectInfo> getProjects() {
        Map<Integer, ProjectInfo> projects;
        byte[] bytes = prefs.getByteArray("projects", null);
        if (bytes != null) {
            try {
                projects = (HashMap<Integer, ProjectInfo>) bytes2Object(bytes);
            }
            catch(Exception e) {
                projects = new HashMap<>();
            }
        }
        else {
            projects = new HashMap<>();
        }

        for (int id : projects.keySet()) {
            if (id > maxId) {
                maxId = id;
            }
        }
        return projects;
    }

    public Project addProject(String path) {

        // we have a problem if the path doesn't exist
        File f = new File(path);
        if (!f.exists()) {
            throw new BadRequestException();
        }

        Map<Integer, ProjectInfo> projects = getProjects();

        // check for dupes
        for (Map.Entry<Integer, ProjectInfo>entry : projects.entrySet()) {
            if (entry.getValue().path.equals(path)) {
                return getProject(entry.getValue().id);
            }
        }

        int id = ++maxId;
        ProjectInfo pi = new ProjectInfo(id, path);
        projects.put(pi.id, pi);
        this.save(projects);
        return getProject(pi.id);
    }

    public Project getProject(int id) {
        Map<Integer, ProjectInfo> projects = getProjects();
        ProjectInfo pi = projects.get(id);
        if (pi != null) {
            project.setId(pi.id);
            project.setPath(pi.path);
        }
        else {
            throw new NotFoundException();
        }
        return project;
    }

    public void setLastProject(int id) throws IOException {
        prefs.putInt("lastProject", id);
    }

    public int getLastProject() {
        return prefs.getInt("lastProject", -1);
    }

    public void removeProject(int id) {
        Map<Integer, ProjectInfo> projects = getProjects();
        projects.remove(id);
        save(projects);
    }

    public void reset() {
        prefs.remove("projects");
        prefs.remove("lastProject");
        maxId = 0;
    }

    private void save(Map<Integer, ProjectInfo> projects) {
        try {
            prefs.putByteArray("projects", object2Bytes(projects));
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
}
