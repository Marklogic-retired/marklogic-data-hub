package com.marklogic.hub.oneui.models;

import java.util.List;

public class ArtifactTypeInfo {
    public String type;
    public List<String> storageDatabases;
    public List<String> collections;
    public String fileExtension;
    public String directory;
    public String nameProperty;
    public String versionProperty;


    public ArtifactTypeInfo(String type, List<String> storageDatabases, List<String> collections, String fileExtension, String directory, String nameProperty, String versionProperty) {
        this.type = type;
        this.storageDatabases = storageDatabases;
        this.collections = collections;
        this.fileExtension = fileExtension;
        this.directory = directory;
        this.nameProperty = nameProperty;
        this.versionProperty = versionProperty;
    }}
