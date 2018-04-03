package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;

public class GeneratePiiCommand extends AbstractCommand {

    private HubConfig hubConfig;

    public GeneratePiiCommand(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public void execute(CommandContext context) {
        EntityManager entityManager = EntityManager.create(hubConfig);
        entityManager.savePii();
    }
}
