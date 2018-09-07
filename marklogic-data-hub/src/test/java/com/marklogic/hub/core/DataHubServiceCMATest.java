package com.marklogic.hub.core;

import com.marklogic.hub.HubTestBase;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.cma.ConfigurationManager;
import org.apache.commons.io.IOUtils;
import org.junit.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

public class DataHubServiceCMATest extends HubTestBase {


    @Test public void loadRolesAndSuch() throws IOException {
        ManageClient manageClient = new ManageClient(new com.marklogic.mgmt.ManageConfig(host, 8002, secUser, secPassword));
        ConfigurationManager cma = new ConfigurationManager(manageClient);

        ClassPathResource roles = new ClassPathResource("hub-internal-config/configurations/01-roles.json");
        String payload = IOUtils.toString(roles.getInputStream(), "UTF-8");
        cma.save(payload);

        ClassPathResource privileges = new ClassPathResource("hub-internal-config/configurations/02-privileges.json");
        payload = IOUtils.toString(privileges.getInputStream(), "UTF-8");
        cma.save(payload);

        ClassPathResource assignments = new ClassPathResource("hub-internal-config/configurations/03-assignments.json");
        payload = IOUtils.toString(assignments.getInputStream(), "UTF-8");
        cma.save(payload);

        ClassPathResource amps = new ClassPathResource("hub-internal-config/configurations/04-amps.json");
        payload = IOUtils.toString(amps.getInputStream(), "UTF-8");
        cma.save(payload);
    }
}
