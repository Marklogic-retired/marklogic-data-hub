package com.marklogic.hub.dhs;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.hub.dhs.installer.deploy.DeployHubAmpsCommand;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DeployAsSecurityAdminTest {

    @Test
    void buildCommands() {
        List<Command> commands = new DhsDeployer().buildCommandsForSecurityAdmin();
        assertEquals(3, commands.size());

        // As of 5.3.0, a data-hub-security-admin can only deploy roles, privileges and amps
        assertTrue(commands.get(0) instanceof DeployPrivilegesCommand);
        assertTrue(commands.get(1) instanceof DeployRolesCommand);
        assertTrue(commands.get(2) instanceof DeployHubAmpsCommand);
    }
}
