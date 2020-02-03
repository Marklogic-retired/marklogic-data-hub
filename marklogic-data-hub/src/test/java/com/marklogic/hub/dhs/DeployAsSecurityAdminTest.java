package com.marklogic.hub.dhs;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DeployAsSecurityAdminTest {

    @Test
    void buildCommands() {
        List<Command> commands = new DhsDeployer().buildCommandsForSecurityAdmin();
        assertEquals(2, commands.size());

        // As of 5.2.0, a data-hub-security-admin can only deploy roles and privileges
        assertTrue(commands.get(0) instanceof DeployPrivilegesCommand);
        assertTrue(commands.get(1) instanceof DeployRolesCommand);
    }
}
