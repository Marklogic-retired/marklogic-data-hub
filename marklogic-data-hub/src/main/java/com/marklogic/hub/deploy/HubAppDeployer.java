package com.marklogic.hub.deploy;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.UndoableCommand;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.admin.AdminManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class HubAppDeployer extends SimpleAppDeployer {

    private ManageClient manageClient;
    private AdminManager adminManager;
    private HubDeployStatusListener listener;

    public HubAppDeployer(ManageClient manageClient, AdminManager adminManager, HubDeployStatusListener listener) {
        super(manageClient, adminManager);
        this.manageClient = manageClient;
        this.adminManager = adminManager;
        this.listener = listener;
    }

    @Override
    public void deploy(AppConfig appConfig) {
        logger.info(format("Deploying app %s with config dir of: %s\n", appConfig.getName(), appConfig.getFirstConfigDir()
                .getBaseDir().getAbsolutePath()));

        List<Command> commands = getCommands();
        Collections.sort(commands, new Comparator<Command>() {
            @Override
            public int compare(Command o1, Command o2) {
                return o1.getExecuteSortOrder().compareTo(o2.getExecuteSortOrder());
            }

            @Override
            public boolean equals(Object obj) {
                return this.equals(obj);
            }
        });

        CommandContext context = new CommandContext(appConfig, manageClient, adminManager);

        int count = commands.size();
        int completed = 0;
        onStatusChange(0, "Installing...");
        for (Command command : commands) {
            String name = command.getClass().getName();
            logger.info(format("Executing command [%s] with sort order [%d]", name, command.getExecuteSortOrder()));
            float percent = ((float)completed / (float)count) * 100;
            onStatusChange((int)percent, format("[Step %d of %d]  %s", completed + 1, count, name));
            command.execute(context);
            logger.info(format("Finished executing command [%s]\n", name));
            completed++;
        }
        onStatusChange(100, "Installation Complete");
        logger.info(format("Deployed app %s", appConfig.getName()));
    }

    @Override
    public void undeploy(AppConfig appConfig) {
        logger.info(format("Undeploying app %s with config dir: %s\n", appConfig.getName(), appConfig.getFirstConfigDir()
            .getBaseDir().getAbsolutePath()));

        List<Command> commands = getCommands();

        List<UndoableCommand> undoableCommands = new ArrayList<>();
        for (Command command : commands) {
            if (command instanceof UndoableCommand) {
                undoableCommands.add((UndoableCommand) command);
            }
        }

        Collections.sort(undoableCommands, new Comparator<UndoableCommand>() {
            @Override
            public int compare(UndoableCommand o1, UndoableCommand o2) {
                return o1.getUndoSortOrder().compareTo(o2.getUndoSortOrder());
            }

            @Override
            public boolean equals(Object obj) {
                return this.equals(obj);
            }
        });

        int count = undoableCommands.size();
        int completed = 0;
        onStatusChange(0, "Uninstalling...");

        for (UndoableCommand command : undoableCommands) {
            String name = command.getClass().getName();
            logger.info(format("Undoing command [%s] with sort order [%d]", name, command.getUndoSortOrder()));
            float percent = ((float)completed / (float)count) * 100;
            onStatusChange((int)percent, format("[Step %d of %d]  %s", completed + 1, count, name));
            command.undo(new CommandContext(appConfig, manageClient, adminManager));
            logger.info(format("Finished undoing command [%s]\n", name));
            completed++;
        }
        onStatusChange(100, "Installation Complete");

        logger.info(format("Undeployed app %s", appConfig.getName()));
    }

    private void onStatusChange(int percentComplete, String message) {
        if (this.listener != null) {
            this.listener.onStatusChange(percentComplete, message);
        }
    }

    private void onError() {
        if (this.listener != null) {
            this.listener.onError();
        }
    }
}
