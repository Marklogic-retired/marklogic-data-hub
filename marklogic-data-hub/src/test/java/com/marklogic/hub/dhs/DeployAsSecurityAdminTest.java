package com.marklogic.hub.dhs;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DeployAsSecurityAdminTest {

    @Test
    void buildCommands() {
        List<Command> commands = new DhsDeployer().buildCommandsForSecurityAdmin();
        assertEquals(1, commands.size());
        assertTrue(commands.get(0) instanceof DeployRolesCommand,
            "As of 5.2.0, a data-hub-security-admin can only deploy roles");
    }
}
