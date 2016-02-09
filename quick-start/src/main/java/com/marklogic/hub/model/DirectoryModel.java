package com.marklogic.hub.model;

import java.util.ArrayList;
import java.util.List;

public class DirectoryModel {

	private String parentDirPath;
	private String directoryName;
	private List<DirectoryModel> directories = new ArrayList<>();
	private List<String> files = new ArrayList<>();
	
	public String getDirectoryName() {
		return directoryName;
	}
	public void setDirectoryName(String directoryName) {
		this.directoryName = directoryName;
	}
	public List<DirectoryModel> getDirectories() {
		return directories;
	}
	public void setDirectories(List<DirectoryModel> directories) {
		this.directories = directories;
	}
	public List<String> getFiles() {
		return files;
	}
	public void setFiles(List<String> files) {
		this.files = files;
	}
	public String getParentDirPath() {
		return parentDirPath;
	}
	public void setParentDirPath(String parentDirPath) {
		this.parentDirPath = parentDirPath;
	}
	
	
}
