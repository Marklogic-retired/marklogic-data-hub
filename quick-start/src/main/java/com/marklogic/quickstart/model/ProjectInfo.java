package com.marklogic.quickstart.model;

import java.io.Serializable;

public class ProjectInfo implements Serializable {
    private static final long serialVersionUID = -5546413360518633702L;

    public int id;
    public String path;

    public ProjectInfo(int id, String path) {
        this.id = id;
        this.path = path;
    }
}
