package com.marklogic.hub.web.controller.api;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.model.SearchPathModel;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.web.controller.BaseController;

@RestController
@RequestMapping("/api/utils")
public class UtilController extends BaseController {

	private static final Logger LOGGER = LoggerFactory.getLogger(UtilController.class);

	@Autowired
	private EnvironmentConfiguration environmentConfiguration;

	@RequestMapping(value = "/searchPath", method = RequestMethod.POST, consumes = {
			MediaType.APPLICATION_JSON_UTF8_VALUE }, produces = { MediaType.APPLICATION_JSON_UTF8_VALUE })
	public Map searchPath(@RequestBody SearchPathModel searchPathModel) {
		return searchPathUnix(searchPathModel.getPath());
	}

	public Map searchPathUnix(String searchPath) {

		LOGGER.debug("Search Path:" + searchPath);
		List<SearchPathModel> paths = new ArrayList<SearchPathModel>();
		if (StringUtils.isEmpty(searchPath)) {
			File[] roots = File.listRoots();
			for (int i = 0; i < roots.length; i++) {
				LOGGER.debug("Path:" + roots[i].getAbsolutePath());
				paths.add(new SearchPathModel(roots[i].getAbsolutePath(), roots[i].getAbsolutePath()));
			}
		} else {
			if (!searchPath.equals("/")) {
				searchPath = searchPath + java.io.File.separator;
			}

			List<String> folders = FileUtil.listDirectFolders(searchPath);
			for (String folder : folders) {
				String path = searchPath + folder;
				LOGGER.debug("Path:" + path);
				paths.add(new SearchPathModel(path, folder));
			}
		}

		Map returnValue = new HashMap();

		returnValue.put("paths", paths);

		return returnValue;
	}
	
	/*

	public static void main(String[] args) {
		new UtilController().searchPathUnix("/");
		new UtilController().searchPathUnix("/Users");
		new UtilController().searchPathUnix("");
	}
	*/
}
