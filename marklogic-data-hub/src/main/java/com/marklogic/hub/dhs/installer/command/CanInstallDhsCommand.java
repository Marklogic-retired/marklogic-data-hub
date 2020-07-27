package com.marklogic.hub.dhs.installer.command;

import com.beust.jcommander.Parameters;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.dhs.installer.Options;
import com.marklogic.hub.impl.Versions;
import com.marklogic.hub.impl.Versions.MarkLogicVersion;
import org.springframework.context.ApplicationContext;

@Parameters(commandDescription = "Verify if current version of DHF can be installed in a DHS environment")
public class CanInstallDhsCommand extends AbstractInstallerCommand {

    ObjectMapper mapper = new ObjectMapper();

    @Override
    public void run(ApplicationContext context, Options options) {
        try {
            initializeProject(context, options, new InstallIntoDhsCommand().buildDefaultProjectProperties(options));
            ObjectNode node = canInstallDhs();
            System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(node));
            if(! node.get("canBeInstalled").booleanValue()){
                System.exit(1);
            }

        } catch (Exception e) {
            ObjectNode node = mapper.createObjectNode();
            node.put("canBeInstalled", false);
            node.put("message", e.getMessage());
            System.out.println(node.toString());
        }
    }
}
