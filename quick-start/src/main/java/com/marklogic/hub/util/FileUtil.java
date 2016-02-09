package com.marklogic.hub.util;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.hub.model.DirectoryModel;

public class FileUtil {

	private static final Logger LOGGER = LoggerFactory
			.getLogger(FileUtil.class);

	public static final String DOMAINS_FOLDER = "domains";

	public static List<String> listDirectFolders(String path) {
		List<String> folders = new ArrayList<>();
		File rootDirectory = new File(path);
		if (rootDirectory.exists() && rootDirectory.isDirectory()) {
			File[] files = rootDirectory.listFiles();
			for (File file : files) {
				if (file.isDirectory()) {
					folders.add(file.getName());
				}
			}
		}
		return folders;
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

	public static void createDirectories(DirectoryModel directoryModel) {
		FileUtil.createFolderIfNecessary(directoryModel.getParentDirPath(),
				directoryModel.getDirectoryName());
		for (DirectoryModel childDirectory : directoryModel.getDirectories()) {
			FileUtil.createDirectories(childDirectory);
		}
	}
}
