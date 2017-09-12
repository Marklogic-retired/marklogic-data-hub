/*
 * Copyright 2012-2016 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.quickstart.web;

import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.model.SearchPathModel;
import com.marklogic.quickstart.util.FileUtil;
import com.sun.org.apache.xpath.internal.operations.Bool;
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
public class UtilController extends EnvironmentAware {

	@RequestMapping(value = "/searchPath", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> searchPath(@RequestParam String path, @RequestParam boolean absolute) {
		logger.debug("Search Path:" + path);
		List<SearchPathModel> paths = new ArrayList<>();
		String currentPath;

		if (path == null || path.length() == 0) {
		    currentPath = "/";
			File[] roots = File.listRoots();
            for (File root : roots) {
                paths.add(new SearchPathModel(root.getAbsolutePath(), root.getAbsolutePath()));
            }
		}
		else {
		    if (absolute) {
                currentPath = Paths.get(path).toAbsolutePath().normalize().toString();
            }
            else {
                currentPath = path;
            }
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

		Map<String, Object> result = new HashMap<>();
		result.put("currentPath", currentPath);
		result.put("folders", paths);
		return result;
	}

	@RequestMapping(value = "/validatePath", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Boolean> validatePath(@RequestParam String path) {
	    File pathToValidate = new File(path);
        Map<String, Boolean> result = new HashMap<>();
        result.put("valid", pathToValidate.exists() && pathToValidate.isFile() && pathToValidate.canExecute());
        return result;
    }
}
