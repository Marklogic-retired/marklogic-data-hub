/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web.web;

import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.web.model.SearchPathModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class UtilController {

    private static Logger logger = LoggerFactory.getLogger(UtilController.class);

	@RequestMapping(value = "/searchPath", method = RequestMethod.GET)
	@ResponseBody
	public Map<String, Object> searchPath(@RequestParam String path) {
		logger.debug("Search Path:" + path);
		List<SearchPathModel> folders = new ArrayList<>();
		List<SearchPathModel> files = new ArrayList<SearchPathModel>();
		Path currentPath = Paths.get(".").toAbsolutePath().normalize();
		Path relativePath;

		if (path == null || path.length() == 0) {
            relativePath = Paths.get("/");
		}
		else {
            relativePath = Paths.get(path).toAbsolutePath().normalize();
        }

        Path parent = relativePath.getParent();
        if (parent != null) {
            String relativePathStr = currentPath.relativize(parent).toString();
            String absolutePathStr = parent.toAbsolutePath().toString();
            folders.add(new SearchPathModel("..", relativePathStr, absolutePathStr));
        }

        for (String folder : FileUtil.listDirectFolders(relativePath)) {
            Path childPath = relativePath.resolve(folder);
            String relativePathStr = currentPath.relativize(childPath).toString();
            String absolutePathStr = childPath.toAbsolutePath().normalize().toString();
            folders.add(new SearchPathModel(folder, relativePathStr, absolutePathStr));
        }

        for (String file : FileUtil.listDirectFiles(relativePath)) {
            Path childPath = relativePath.resolve(file);
            String relativePathStr = currentPath.relativize(childPath).toString();
            String absolutePathStr = childPath.toAbsolutePath().normalize().toString();
            files.add(new SearchPathModel(file, relativePathStr, absolutePathStr));
        }


		Map<String, Object> result = new HashMap<>();
        String relativePathStr = currentPath.relativize(relativePath).toString();
        if (relativePathStr.equals("")) {
            relativePathStr = ".";
        }
		result.put("currentPath", relativePathStr);
		result.put("currentAbsolutePath", relativePath.toString());
		result.put("folders", folders);
		result.put("files", files);
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
