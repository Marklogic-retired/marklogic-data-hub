package com.marklogic.hub.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TreeData {

    public static final String KEY_ABSOLUTE_PATH = "absolutePath";

    private Map<String, String> data = new HashMap<>();
    private String label;
    private List<TreeData> children = new ArrayList<>();
    private boolean noLeaf;

    public TreeData() {

    }

    public TreeData(String absolutePath, String label) {
        data.put(KEY_ABSOLUTE_PATH, absolutePath);
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public List<TreeData> getChildren() {
        return children;
    }

    public void setChildren(List<TreeData> children) {
        this.children = children;
    }

    public boolean isNoLeaf() {
        return noLeaf;
    }

    public void setNoLeaf(boolean noLeaf) {
        this.noLeaf = noLeaf;
    }

    public Map<String, String> getData() {
        return data;
    }

    public void setData(Map<String, String> data) {
        this.data = data;
    }

}
