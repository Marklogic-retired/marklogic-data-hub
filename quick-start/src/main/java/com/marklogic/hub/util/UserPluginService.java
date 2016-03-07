package com.marklogic.hub.util;

import java.io.File;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.model.FlowType;
import com.marklogic.hub.web.controller.api.DataHubServerApiController;

@Service
public class UserPluginService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DataHubServerApiController.class);
    
    @Autowired
    private EnvironmentConfiguration environmentConfiguration;

    public UserPluginFileInfo getUserPluginFileInfo(String path) {
        try {
            String entitiesPath = new File(environmentConfiguration.getUserPluginDir() + File.separator + "entities").getCanonicalPath();

            String entityName = null;
            String flowName = null;
            FlowType flowType = null;
            if (path.indexOf(entitiesPath) == 0) {
                String suffix = path.substring(entitiesPath.length());
                String[] pathTokens = suffix.split("[/\\\\]");

                if (pathTokens != null) {
                    entityName = pathTokens.length >= 2 ? pathTokens[1] : null;
                    flowName = pathTokens.length >= 4 ? pathTokens[3] : null;

                    String flowTypeStr = pathTokens.length >= 3 ? pathTokens[2] : null;
                    flowType = flowTypeStr != null ? FlowType.getFlowType(flowTypeStr) : null;
                }
            }
            
            return new UserPluginFileInfo(entityName, flowName, flowType);
        } catch (IOException e) {
            LOGGER.error("Cannot get info from path: " + path, e);
            return new UserPluginFileInfo(null, null, null);
        }
    }
}
