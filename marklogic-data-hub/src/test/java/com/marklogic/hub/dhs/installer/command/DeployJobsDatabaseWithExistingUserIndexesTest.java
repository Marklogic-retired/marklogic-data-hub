package com.marklogic.hub.dhs.installer.command;

import com.marklogic.appdeployer.command.Command;
import com.marklogic.appdeployer.command.databases.DeployOtherDatabasesCommand;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.deploy.commands.HubDeployDatabaseCommandFactory;
import com.marklogic.hub.dhs.installer.Options;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class DeployJobsDatabaseWithExistingUserIndexesTest extends AbstractHubCoreTest {

    boolean originalIsProvisionedEnvironment;

    @BeforeEach
    void beforeEach() {
        originalIsProvisionedEnvironment = getHubConfig().getIsProvisionedEnvironment();
    }

    @AfterEach
    void afterEach() {
        getHubConfig().setIsProvisionedEnvironment(originalIsProvisionedEnvironment);
    }

    @Test
    void test() {
        givenTheJobsDatabaseHasCustomUserIndexes();
        whenTheDhfInstallerCommandForDatabasesIsRun();

        // The user indexes should still exist, even though the installer doesn't have access to them
        verifyUserIndexesExist();
    }

    private void givenTheJobsDatabaseHasCustomUserIndexes() {
        installProjectInFolder("test-projects/custom-job-indexes");
        runAsFlowDeveloper();
        DeployOtherDatabasesCommand command = new DeployOtherDatabasesCommand();
        command.setDeployDatabaseCommandFactory(new HubDeployDatabaseCommandFactory(getHubConfig()));
        command.execute(newCommandContext());
        verifyUserIndexesExist();
    }

    private void whenTheDhfInstallerCommandForDatabasesIsRun() {
        InstallIntoDhsCommand installCommand = new InstallIntoDhsCommand();
        installCommand.hubConfig = getHubConfig();

        List<Command> commands = installCommand.buildCommandsForDhs(new Options());
        DeployOtherDatabasesCommand dbCommand = null;
        for (Command c : commands) {
            if (c instanceof DeployOtherDatabasesCommand) {
                dbCommand = (DeployOtherDatabasesCommand) c;
                break;
            }
        }

        // Clear our the test directory so we don't pick up user indexes (which will never be accessible to the installer)
        deleteTestProjectDirectory();
        initializeTestProjectDirectory();

        dbCommand.execute(newCommandContext());
    }

    private void verifyUserIndexesExist() {
        Fragment jobDb = new DatabaseManager(getHubConfig().getManageClient()).getPropertiesAsXml(getHubConfig().getDbName(DatabaseKind.JOB));
        assertEquals(1, jobDb.getElements("//m:range-element-index[m:localname = 'CustomJobIndexTest']").size());
        assertEquals(1, jobDb.getElements("//m:range-path-index[m:path-expression = '/Custom/Job/Index/Test']").size());

        // Verify at least one OOTB index of each type exists too
        assertEquals(1, jobDb.getElements("//m:range-element-index[m:localname = 'jobId']").size());
        assertEquals(1, jobDb.getElements("//m:range-path-index[m:path-expression = '/trace/flowType']").size());
    }
}
