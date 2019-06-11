package com.marklogic.hub.cli.upgrader;

import com.marklogic.hub.cli.InstallerCommand;
import com.marklogic.hub.cli.Options;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.List;

public interface Upgrader {

    String getTargetVersion();

    List<String> getSupportedVersions();

    void beforeInstall(ConfigurableApplicationContext context, InstallerCommand command, Options options);

    void afterInstall(ConfigurableApplicationContext context, InstallerCommand command, Options options);
}
