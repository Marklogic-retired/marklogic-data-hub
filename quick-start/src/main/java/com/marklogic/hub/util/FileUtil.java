package com.marklogic.hub.util;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class FileUtil {

	public static List<String> listDirectFolders(String path) {
		List<String> folders = new ArrayList<>();
		File rootDirectory = new File(path);
		if(rootDirectory.exists() && rootDirectory.isDirectory()) {
			File[] files = rootDirectory.listFiles();
			for (File file : files) {
				if(file.isDirectory()) {
					folders.add(file.getName());
				}
			}
		}
		return folders;
	}
}
