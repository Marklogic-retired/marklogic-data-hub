package com.marklogic.hub.cli;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.impl.HubConfigImpl;

import java.io.File;
import java.util.Map;
import java.util.Properties;

public abstract class AbstractInstallerCommand extends LoggingObject implements InstallerCommand {

    /**
     * The intended use case is that an installer command can be run from any directory, which means we need to first
     * initialize a DHF project (specifically, generating the gradle.properties file) and then refresh HubConfig based
     * on those properties and anything a client passed in via JVM props. This allows for all of the DHF properties to
     * be read in and used for connecting to a DHF instance.
     *
     * @param options
     */
    protected File initializeProject(HubConfigImpl hubConfig, Options options, Properties props) {
        final File projectDir = new File(options.getProjectPath());

        logger.info("Initializing DHF into project directory: " + projectDir);

        hubConfig.createProject(projectDir.getAbsolutePath());
        hubConfig.initHubProject();

        Map<String, String> params = options.getParams();
        if (params != null) {
            for (String key : params.keySet()) {
                props.setProperty(key, params.get(key));
            }
        }

        hubConfig.refreshProject(props, true);

        return projectDir;
    }
}
