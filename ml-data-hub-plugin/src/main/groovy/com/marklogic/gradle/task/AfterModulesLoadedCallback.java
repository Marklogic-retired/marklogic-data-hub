package com.marklogic.gradle.task;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.gradle.task.client.ModuleWatchingContext;
import com.marklogic.hub.deploy.commands.LoadUserModulesCommand;

import java.util.function.Consumer;

/**
 * Callback for mlWatch, such that the modules can be loaded from DHF 4's custom location (the "plugins" path).
 */
public class AfterModulesLoadedCallback implements Consumer<ModuleWatchingContext> {

    private LoadUserModulesCommand loadUserModulesCommand;
    private CommandContext commandContext;

    public AfterModulesLoadedCallback(LoadUserModulesCommand command, CommandContext commandContext) {
        this.loadUserModulesCommand = command;
        this.loadUserModulesCommand.setWatchingModules(true);
        this.commandContext = commandContext;
    }

    @Override
    public void accept(ModuleWatchingContext moduleWatchingContext) {
        loadUserModulesCommand.execute(commandContext);
    }
}
