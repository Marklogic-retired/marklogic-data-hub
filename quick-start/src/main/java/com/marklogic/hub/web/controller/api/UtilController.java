package com.marklogic.hub.web.controller.api;

import java.io.File;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.marklogic.hub.model.SearchPathModel;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.web.controller.BaseController;

@RestController
@RequestMapping("/api/utils")
public class UtilController extends BaseController {

	private static final Logger LOGGER = LoggerFactory.getLogger(UtilController.class);

	@RequestMapping(value = "/searchPath", method = RequestMethod.POST, consumes = {
			MediaType.APPLICATION_JSON_UTF8_VALUE }, produces = { MediaType.APPLICATION_JSON_UTF8_VALUE })
	public Map<String, List<SearchPathModel>> searchPath(@RequestBody SearchPathModel searchPathModel) {
		return searchPathUnix(searchPathModel.getPath());
	}

	public Map<String, List<SearchPathModel>> searchPathUnix(String searchPath) {

		LOGGER.debug("Search Path:" + searchPath);
		List<SearchPathModel> paths = new ArrayList<SearchPathModel>();
		if (StringUtils.isEmpty(searchPath)) {
			File[] roots = File.listRoots();
			for (int i = 0; i < roots.length; i++) {
				paths.add(new SearchPathModel(roots[i].getAbsolutePath(), roots[i].getAbsolutePath()));
			}
		}
		else {
			if (!searchPath.equals("/")) {
				searchPath = searchPath + java.io.File.separator;
				String path = Paths.get(searchPath).getParent().toAbsolutePath().normalize().toString();
				paths.add(new SearchPathModel(path, ".."));
			}

			List<String> folders = FileUtil.listDirectFolders(searchPath);
			for (String folder : folders) {
				String path = Paths.get(searchPath, folder).toAbsolutePath().normalize().toString();
				paths.add(new SearchPathModel(path, folder));
			}
		}

		Map<String, List<SearchPathModel>> returnValue = new HashMap<String, List<SearchPathModel>>();

		returnValue.put("paths", paths);

		return returnValue;
	}
}
