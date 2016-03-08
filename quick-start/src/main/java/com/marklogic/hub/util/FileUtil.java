package com.marklogic.hub.util;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.hub.model.TreeData;

public class FileUtil {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(FileUtil.class);

    public static final String ENTITIES_FOLDER = "entities";

    public static List<String> listDirectFolders(String path) {
        List<String> folders = new ArrayList<>();
        File rootDirectory = new File(path);
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

    public static List<TreeData> listDirectFilesAndFolders(String path) {
        List<TreeData> treeDataList = new ArrayList<>();
        File rootDirectory = new File(path);
        if (rootDirectory.exists() && rootDirectory.isDirectory()) {
            File[] files = rootDirectory.listFiles();
            for (File file : files) {
                if (!file.isHidden()) {
                    TreeData treeData = new TreeData(file.getAbsolutePath(),
                            file.getName());
                    treeData.setNoLeaf(file.isDirectory());
                    treeDataList.add(treeData);
                }
            }
        }
        return treeDataList;
    }

    public static String createFolderIfNecessary(String path, String folderName) {
        File rootDirectory = new File(path);
        if (!rootDirectory.exists()) {
            LOGGER.debug("New folder is created at "
                    + rootDirectory.getAbsolutePath());
            rootDirectory.mkdir();
        }
        if (rootDirectory.exists() && rootDirectory.isDirectory()) {
            File folder = new File(rootDirectory.getAbsolutePath()
                    + File.separator + folderName);
            if (!folder.exists()) {
                folder.mkdir();
                LOGGER.debug("New folder is created at "
                        + folder.getAbsolutePath());
            }
        }
        return path + File.separator + folderName;
    }

    public static void createDirectories(TreeData treeData) {
        File file = new File(treeData.getData().get(TreeData.KEY_ABSOLUTE_PATH));
        FileUtil.createFolderIfNecessary(file.getParent(), treeData.getLabel());
        for (TreeData childTreeData : treeData.getChildren()) {
            FileUtil.createDirectories(childTreeData);
        }
    }
}
