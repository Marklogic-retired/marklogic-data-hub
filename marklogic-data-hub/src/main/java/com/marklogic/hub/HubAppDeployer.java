package com.marklogic.hub;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;

public class HubAppDeployer extends SimpleAppDeployer {

    private ManageClient manageClient;
    private AdminManager adminManager;
    private StatusListener listener;

    public HubAppDeployer(ManageClient manageClient, AdminManager adminManager, StatusListener listener) {
        super(manageClient, adminManager);
        this.manageClient = manageClient;
        this.adminManager = adminManager;
        this.listener = listener;
    }

    @Override
    public void deploy(AppConfig appConfig) {
        logger.info(format("Deploying app %s with config dir of: %s\n", appConfig.getName(), appConfig.getConfigDir()
                .getBaseDir().getAbsolutePath()));

        List<Command> commands = getCommands();
        Collections.sort(commands, new ExecuteComparator());

        CommandContext context = new CommandContext(appConfig, manageClient, adminManager);

        int count = commands.size();
        int completed = 0;
        listener.onStatusChange(100, "Installing...");
        for (Command command : commands) {
            String name = command.getClass().getName();
            logger.info(format("Executing command [%s] with sort order [%d]", name, command.getExecuteSortOrder()));
            float percent = ((float)completed / (float)count) * 100;
            logger.error("percent: " + percent);
            listener.onStatusChange((int)percent, format("[Step %d of %d]  %s", completed + 1, count, name));
            command.execute(context);
            logger.info(format("Finished executing command [%s]\n", name));
            completed++;
        }
        listener.onStatusChange(100, "Installation Complete");
        logger.info(format("Deployed app %s", appConfig.getName()));
    }
}

class ExecuteComparator implements Comparator<Command> {
    @Override
    public int compare(Command o1, Command o2) {
        return o1.getExecuteSortOrder().compareTo(o2.getExecuteSortOrder());
    }
}