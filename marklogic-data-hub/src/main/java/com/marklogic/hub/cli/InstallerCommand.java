package com.marklogic.hub.cli;

import org.springframework.context.ApplicationContext;

public interface InstallerCommand {

    /**
     * A command is given an instance of a Spring container, which is expected to be constructed based on the
     * properties fed into the installer, and an Options instance that captures the options the user passed into the
     * installer.
     *
     * @param context
     * @param options
     */
    void run(ApplicationContext context, Options options);

}
