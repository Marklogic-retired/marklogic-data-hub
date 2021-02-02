/*
 * Copyright (c) 2021 MarkLogic Corporation
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
package com.marklogic.hub.dhs.installer.deploy;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesFinder;
import com.marklogic.hub.HubConfig;
import org.apache.commons.io.FilenameUtils;
import org.springframework.core.io.Resource;

import java.util.List;


public class UpdateDhsModulesPermissionsCommand extends AbstractCommand {

    private HubConfig hubConfig;

    //This command has to be run after LoadHubModulesCommand is run.
    public UpdateDhsModulesPermissionsCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        setExecuteSortOrder(SortOrderConstants.LOAD_MODULES + 1);
    }

    @Override
    public void execute(CommandContext context) {
        DefaultModulesFinder moduleFinder = new DefaultModulesFinder();
        Modules modules = moduleFinder.findModules("classpath*:/ml-modules");

        runScript("resource", modules.getServices());
        runScript("transform", modules.getTransforms());
    }

    private void runScript(String extensionType, List<Resource> resources) {
        String script = "declareUpdate();\n" +
            "let fileNames = " + convertToJsArray(resources) + ";\n" +
            "var i;\n" +
            "for(i = 0; i < fileNames.length; i++) {\n" +
            "  let partUri = '/marklogic.rest." + extensionType + "/' + fileNames[i] + '/assets/';\n" +
            "  xdmp.documentRemovePermissions(partUri + 'metadata.xml', xdmp.permission('rest-extension-user', 'update'));\n" +
            "  xdmp.documentAddPermissions(partUri + 'metadata.xml', xdmp.permission('data-hub-environment-manager', 'update'));\n" +
            "  if (fn.docAvailable(partUri + '" + extensionType + ".sjs')){ \n" +
            "    xdmp.documentRemovePermissions(partUri +'" + extensionType + ".sjs', xdmp.permission('rest-admin-internal', 'update'));\n" +
            "    xdmp.documentAddPermissions(partUri + '" + extensionType + ".sjs', xdmp.permission('data-hub-environment-manager', 'update')); \n" +
            "  } \n" +
            "  xdmp.documentRemovePermissions(partUri + '" + extensionType + ".xqy', xdmp.permission('rest-admin-internal', 'update'));\n" +
            "  xdmp.documentAddPermissions(partUri + '" + extensionType + ".xqy', xdmp.permission('data-hub-environment-manager', 'update'));  \n" +
            "}";
        DatabaseClient client = hubConfig.newModulesDbClient();
        try {
            client.newServerEval().javascript(script).eval().close();
        } finally {
            client.release();
        }

    }

    private String convertToJsArray(List<Resource> resources) {
        StringBuilder sb = new StringBuilder();
        for (Resource r : resources) {
            sb.append(",");
            sb.append("\"");
            sb.append(FilenameUtils.removeExtension(r.getFilename()));
            sb.append("\"");
        }

        if (sb.length() > 0) {
            sb.deleteCharAt(0);
        }
        sb.insert(0, "[");
        sb.append("]");
        return sb.toString();
    }
}
