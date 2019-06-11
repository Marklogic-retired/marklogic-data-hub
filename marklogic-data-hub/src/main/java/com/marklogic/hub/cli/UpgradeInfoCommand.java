package com.marklogic.hub.cli;

import com.beust.jcommander.Parameters;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.cli.upgrader.UpgraderFactory;
import com.marklogic.mgmt.util.ObjectMapperFactory;

import java.util.*;

@Parameters(commandDescription = "Writes a JSON object to stdout defining the target version of this installer and an " +
    "array of supported versions")
public class UpgradeInfoCommand extends AbstractInstallerCommand {

    @Override
    public void run(Options options) {
        initializeProject(options, System.getProperties());

        Set<String> supportedVersions = new LinkedHashSet<>();
        UpgraderFactory.getUpgraders().forEach(upgrader -> {
            supportedVersions.addAll(upgrader.getSupportedVersions());
        });

        List<String> sortedList = new ArrayList<>();
        sortedList.addAll(supportedVersions);
        // TODO Need something that understands how to sort semver versions
        Collections.sort(sortedList);

        ObjectNode response = ObjectMapperFactory.getObjectMapper().createObjectNode();
        response.put("targetVersion", hubConfig.getJarVersion());
        ArrayNode array = response.putArray("supportedVersions");
        sortedList.forEach(version -> array.add(version));

        System.out.println(response.toString());
    }
}
