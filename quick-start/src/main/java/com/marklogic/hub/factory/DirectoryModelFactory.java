package com.marklogic.hub.factory;

import com.marklogic.hub.model.DirectoryModel;

public class DirectoryModelFactory {

	private DirectoryModel directoryModel;

	public DirectoryModelFactory(String directoryName) {
		directoryModel = new DirectoryModel();
		directoryModel.setDirectoryName(directoryName);
	}

	public DirectoryModel getDirectoryModel() {
		return directoryModel;
	}

	public void setDirectoryModel(DirectoryModel directoryModel) {
		this.directoryModel = directoryModel;
	}

	public void addEmptyDirectories(String... directoryNames) {
		for (String directoryName : directoryNames) {
			this.addEmptyDirectory(directoryName, directoryModel);
		}
	}

	private DirectoryModel addEmptyDirectory(String directoryName,
			DirectoryModel parentDirectory) {
		DirectoryModel directory = new DirectoryModel();
		directory.setDirectoryName(directoryName);
		parentDirectory.getDirectories().add(directory);
		return directory;
	}

	public void addDirectory(String directoryName,
			String... childDirectoryNames) {
		DirectoryModel directory = this.addEmptyDirectory(directoryName,
				directoryModel);
		for (String childDirectoryName : childDirectoryNames) {
			this.addEmptyDirectory(childDirectoryName, directory);
		}
	}
}
