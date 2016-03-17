package com.marklogic.hub.model;

public class SearchPathModel {

	private String folder;
	private String path;

	public SearchPathModel() {
	}

	public SearchPathModel(String path) {
		this.path = path;
	}

	public SearchPathModel(String path, String folder) {
		this.path = path;
		this.folder = folder;
	}

	public String getFolder() {
		return folder;
	}

	public void setFolder(String folder) {
		this.folder = folder;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

}
