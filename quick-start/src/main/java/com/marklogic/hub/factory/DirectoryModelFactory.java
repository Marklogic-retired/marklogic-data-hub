package com.marklogic.hub.factory;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.marklogic.hub.model.DirectoryModel;
import com.marklogic.hub.util.FileUtil;

public class DirectoryModelFactory {

	private DirectoryModel directoryModel;

	public DirectoryModelFactory(String parentDirPath, String directoryName) {
		directoryModel = new DirectoryModel(parentDirPath, directoryName);
	}

	public void addEmptyDirectories(String parentDirPath,
			String... directoryNames) {
		for (String directoryName : directoryNames) {
			this.addEmptyDirectory(parentDirPath, directoryName, directoryModel);
		}
	}

	private DirectoryModel addEmptyDirectory(String parentDirPath,
			String directoryName, DirectoryModel parentDirectory) {
		DirectoryModel directory = new DirectoryModel(parentDirPath,
				directoryName);
		parentDirectory.getDirectories().add(directory);
		return directory;
	}

	public void addDirectory(String parentDirPath, String directoryName,
			String... childDirectoryNames) {
		DirectoryModel directory = this.addEmptyDirectory(parentDirPath,
				directoryName, directoryModel);
		String newDirecoryPath = parentDirPath + File.separator + directoryName;
		for (String childDirectoryName : childDirectoryNames) {
			this.addEmptyDirectory(newDirecoryPath, childDirectoryName,
					directory);
		}
	}

	public DirectoryModel listFilesAndDirectories() {
		if (directoryModel.getFiles().isEmpty()) {
			directoryModel.setFiles(FileUtil.listDirectFiles(directoryModel
					.getParentDirPath()));
		}
		if (directoryModel.getDirectories().isEmpty()) {
			directoryModel.setDirectories(this.getDirectoryModels(
					directoryModel, false));
		}
		return directoryModel;
	}

	public List<DirectoryModel> listDirectories() {
		if (directoryModel.getDirectories().isEmpty()) {
			directoryModel.setDirectories(this.getDirectoryModels(
					directoryModel, true));
		}
		return directoryModel.getDirectories();
	}

	private List<DirectoryModel> getDirectoryModels(
			DirectoryModel currentDirectoryModel, boolean folderOnly) {
		List<DirectoryModel> directories = new ArrayList<>();
		String parentDirPath = currentDirectoryModel.getParentDirPath()
				+ File.separator + currentDirectoryModel.getDirectoryName();
		List<String> folders = FileUtil.listDirectFolders(parentDirPath);
		for (String folder : folders) {
			DirectoryModel childDirectoryModel = new DirectoryModel(
					parentDirPath, folder);
			directories.add(childDirectoryModel);
			childDirectoryModel.setDirectories(this.getDirectoryModels(
					childDirectoryModel, folderOnly));
			if (!folderOnly) {
				childDirectoryModel.setFiles(FileUtil
						.listDirectFiles(childDirectoryModel.getParentDirPath()
								+ File.separator
								+ childDirectoryModel.getDirectoryName()));
			}
		}
		return directories;
	}

	public void saveDirectories() {
		FileUtil.createDirectories(directoryModel);
	}
}
