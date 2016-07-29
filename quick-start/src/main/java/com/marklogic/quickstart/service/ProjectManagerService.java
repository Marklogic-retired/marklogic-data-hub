package com.marklogic.quickstart.service;

import com.marklogic.client.helper.LoggingObject;
import com.marklogic.quickstart.exception.BadRequestException;
import com.marklogic.quickstart.exception.NotFoundException;
import com.marklogic.quickstart.model.Project;
import com.marklogic.quickstart.model.ProjectInfo;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.HashMap;
import java.util.Map;
import java.util.prefs.Preferences;

@Service
public class ProjectManagerService extends LoggingObject {

    public Map<Integer, ProjectInfo> projects = new HashMap<Integer, ProjectInfo>();
    Preferences prefs = Preferences.userNodeForPackage(ProjectManagerService.class);
    private int maxId = 0;

    @SuppressWarnings("unchecked")
    public ProjectManagerService() throws ClassNotFoundException, IOException {
        byte[] bytes = prefs.getByteArray("projects", null);
        if (bytes != null) {
            projects = (HashMap<Integer, ProjectInfo>) bytes2Object(bytes);
        }

        for (int id : projects.keySet()) {
            if (id > maxId) {
                maxId = id;
            }
        }
    }

    public Project addProject(String path) throws IOException {

        // we have a problem if the path doesn't exist
        File f = new File(path);
        if (!f.exists()) {
            throw new BadRequestException();
        }

        // check for dupes
        for (Map.Entry<Integer, ProjectInfo>entry : projects.entrySet()) {
            if (entry.getValue().path.equals(path)) {
                return getProject(entry.getValue().id);
            }
        }

        int id = ++maxId;
        ProjectInfo pi = new ProjectInfo(id, path);
        projects.put(pi.id, pi);
        this.save();
        return getProject(pi.id);
    }

    public Project getProject(int id) {
        Project project = null;
        ProjectInfo pi = projects.get(id);
        if (pi != null) {
            project = new Project(pi.id, pi.path);
        }
        else {
            throw new NotFoundException();
        }
        return project;
    }

    public void setLastProject(int id) throws IOException {
        prefs.putInt("lastProject", id);
        this.save();
    }

    public int getLastProject() {
        return prefs.getInt("lastProject", -1);
    }

    public void removeProject(int id) throws IOException {
        projects.remove(id);
        save();
    }

    private void save() throws IOException {
        prefs.putByteArray("projects", object2Bytes(projects));
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
        Object o = ois.readObject();
        return o;
    }
}
