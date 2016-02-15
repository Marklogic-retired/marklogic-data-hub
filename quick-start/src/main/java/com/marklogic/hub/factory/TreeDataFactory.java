package com.marklogic.hub.factory;

import java.io.File;
import java.util.List;

import com.marklogic.hub.model.TreeData;
import com.marklogic.hub.util.FileUtil;

public class TreeDataFactory {

    private TreeData treeData;

    public TreeDataFactory(String absolutePath, String label) {
        treeData = new TreeData(absolutePath, label);
    }

    public void addEmptyDirectories(String parentDirPath, String... labels) {
        for (String label : labels) {
            this.addEmptyDirectory(parentDirPath, label, treeData);
        }
    }

    private TreeData addEmptyDirectory(String parentDirPath, String label,
            TreeData parentTreeData) {
        String absolutePath = parentDirPath + File.separator + label;
        TreeData treeData = new TreeData(absolutePath, label);
        parentTreeData.getChildren().add(treeData);
        return treeData;
    }

    public void addDirectory(String parentDirPath, String label,
            String... childLabels) {
        TreeData childTreeData = this.addEmptyDirectory(parentDirPath, label,
                treeData);
        String newDirectoryPath = parentDirPath + File.separator + label;
        for (String childLabel : childLabels) {
            this.addEmptyDirectory(newDirectoryPath, childLabel, childTreeData);
        }
    }

    public TreeData listFilesAndDirectories() {
        if (treeData.getChildren().isEmpty()) {
            treeData.setChildren(this.getChildren(treeData));
        }
        return treeData;
    }

    private List<TreeData> getChildren(TreeData treeData) {
        List<TreeData> children = FileUtil.listDirectFilesAndFolders(treeData
                .getData().get(TreeData.KEY_ABSOLUTE_PATH));
        for (TreeData childTreeData : children) {
            if (childTreeData.isNoLeaf()) {
                childTreeData.setChildren(this.getChildren(childTreeData));
            }
        }
        return children;
    }

    public void saveDirectories() {
        FileUtil.createDirectories(treeData);
    }
}
