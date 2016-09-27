package com.marklogic.quickstart.web;

import com.marklogic.quickstart.model.SearchPathModel;
import com.marklogic.quickstart.util.FileUtil;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api/utils")
public class UtilController extends BaseController {

	@RequestMapping(value = "/searchPath", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> searchPath(@RequestParam String path) {
		logger.debug("Search Path:" + path);
		List<SearchPathModel> paths = new ArrayList<SearchPathModel>();
		String currentPath;

		if (path == null || path.length() == 0) {
		    currentPath = "/";
			File[] roots = File.listRoots();
			for (int i = 0; i < roots.length; i++) {
				paths.add(new SearchPathModel(roots[i].getAbsolutePath(), roots[i].getAbsolutePath()));
			}
		}
		else {
		    currentPath = Paths.get(path).toAbsolutePath().normalize().toString();
			if (!path.equals("/")) {
				path = path + java.io.File.separator;
				Path parent = Paths.get(path).toAbsolutePath().normalize().getParent();
				if (parent != null) {
				    paths.add(new SearchPathModel(parent.toString(), ".."));
				}
			}

			List<String> folders = FileUtil.listDirectFolders(new File(path));
			for (String folder : folders) {
				String absPath = Paths.get(path, folder).toAbsolutePath().normalize().toString();
				paths.add(new SearchPathModel(absPath, folder));
			}
		}

		Map<String, Object> result = new HashMap<String, Object>();
		result.put("currentPath", currentPath);
		result.put("folders", paths);
		return result;
	}
}
