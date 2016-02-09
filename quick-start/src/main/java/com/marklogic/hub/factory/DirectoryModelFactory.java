package com.marklogic.hub.factory;

import java.io.File;

import com.marklogic.hub.model.DirectoryModel;

public class DirectoryModelFactory {

	private DirectoryModel directoryModel;

	public DirectoryModelFactory(String parentDirPath, String directoryName) {
		directoryModel = new DirectoryModel();
		directoryModel.setParentDirPath(parentDirPath);
		directoryModel.setDirectoryName(directoryName);
	}

	public DirectoryModel getDirectoryModel() {
		return directoryModel;
	}

	public void setDirectoryModel(DirectoryModel directoryModel) {
		this.directoryModel = directoryModel;
	}

	public void addEmptyDirectories(String parentDirPath,
			String... directoryNames) {
		for (String directoryName : directoryNames) {
			this.addEmptyDirectory(parentDirPath, directoryName, directoryModel);
		}
	}

	private DirectoryModel addEmptyDirectory(String parentDirPath,
			String directoryName, DirectoryModel parentDirectory) {
		DirectoryModel directory = new DirectoryModel();
		directory.setParentDirPath(parentDirPath);
		directory.setDirectoryName(directoryName);
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
}
