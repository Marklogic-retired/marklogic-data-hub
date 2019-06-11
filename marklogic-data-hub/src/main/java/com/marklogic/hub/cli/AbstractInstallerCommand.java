package com.marklogic.hub.cli;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.impl.DataHubImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.springframework.boot.Banner;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.File;
import java.util.Map;
import java.util.Properties;

public abstract class AbstractInstallerCommand extends LoggingObject implements InstallerCommand {

    protected ConfigurableApplicationContext context;
    protected HubConfigImpl hubConfig;
    protected DataHubImpl dataHub;

    /**
     * The intended use case is that an installer command can be run from any directory, which means we need to first
     * initialize a DHF project (specifically, generating the gradle.properties file) and then refresh HubConfig based
     * on those properties and anything a client passed in via JVM props. This allows for all of the DHF properties to
     * be read in and used for connecting to a DHF instance.
     *
     * @param options
     */
    protected File initializeProject(Options options, Properties props) {
        SpringApplication app = new SpringApplication(ApplicationConfig.class);
        app.setBannerMode(Banner.Mode.OFF);

        this.context = app.run();
        this.dataHub = context.getBean(DataHubImpl.class);
        this.hubConfig = context.getBean(HubConfigImpl.class);

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

    protected String getExistingDhfVersion() {
        final String modulesDbName = hubConfig.getAppConfig().getModulesDatabaseName();
        if (modulesDbName != null) {
            DatabaseManager mgr = new DatabaseManager(hubConfig.getManageClient());
            if (mgr.exists(modulesDbName)) {
                DatabaseClient client = hubConfig.newStagingClient();
                try {
                    return client.newServerEval()
                        .javascript("require('/com.marklogic.hub/config.sjs').HUBVERSION")
                        .evalAs(String.class);
                } finally {
                    client.release();
                }
            }
        }
        return null;
    }


}
