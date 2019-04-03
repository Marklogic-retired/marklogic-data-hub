package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class GeneratePiiCommand extends AbstractCommand {

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private EntityManager entityManager;

    @Override
    public void execute(CommandContext context) {
        entityManager.savePii();
    }

    public void setHubConfig(HubConfig dataHubAdminConfig) {
        this.hubConfig = dataHubAdminConfig;
    }
}
