package com.marklogic.bootstrap;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.io.FileUtils;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.util.CertificateTemplateManagerPlus;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.resource.hosts.HostManager;
import com.marklogic.mgmt.resource.security.CertificateAuthorityManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import com.marklogic.rest.util.JsonNodeUtil;

public class SSLsetup {

    public static void main(String[] args) {
        SSLsetup s = new SSLsetup();
        s.convertToSSL(args);
    }

    private void convertToSSL(String[] args) {
        String mlHost = args[0];
        String mlSecurityUsername = args[1];
        String mlSecurityPassword = args[2];
        boolean certAuth = Boolean.parseBoolean(args[3]);
        boolean sslRun = Boolean.parseBoolean(args[4]);
        if (!(certAuth || sslRun))
            return;

        /*
         * String mlHost = "localhost"; String mlSecurityUsername = "admin"; String
         * mlSecurityPassword = "admin"; boolean certAuth = true;
         */

        ManageClient manageClient = new ManageClient(
                new ManageConfig(mlHost, 8002, mlSecurityUsername, mlSecurityPassword));
        HostManager hostManager = new HostManager(manageClient);
        String bootStrapHost = hostManager.getHostNames().get(0);
        if (!bootStrapHost.toLowerCase().contains("marklogic.com")) {
            throw new DataHubConfigurationException(
                    "The test with current options will run only in marklogic.com domain");
        }

        CertificateTemplateManagerPlus certManager = new CertificateTemplateManagerPlus(manageClient);
        certManager.save(dhfCert());

        String cacert = null;
        try {
            cacert = FileUtils.readFileToString(getResourceFile("ssl/ca-cert.crt"));
        } catch (IOException e) {
            e.printStackTrace();
            // ignore IOException
        }

        CertificateAuthorityManager cam = new CertificateAuthorityManager(manageClient);
        cam.create(cacert);
        try {
            certManager.setCertificatesForTemplate("dhf-cert");
        } catch (IOException e) {
            System.err.println("Unable to associate cert to template");
            e.printStackTrace();
        }

        ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();
        if (certAuth) {
            node.put("authentication", "certificate");            
            ArrayNode certnode = node.arrayNode();
            certnode.add(cacert);
            node.put("ssl-client-certificate-pem", certnode );

        }
        node.put("ssl-certificate-template", "dhf-cert");
        
        try {
            FileUtils.writeStringToFile(new File(System.getProperty("java.io.tmpdir") + "/ssl-server.json"),
                    node.toString());
        } catch (IOException e1) {
            e1.printStackTrace();
            // ignore
        }

        File finalServerFile = getResourceFile("ml-config/servers");
        File hubServerFile = getResourceFile("hub-internal-config/servers");

        // set servers to ssl/ cert-auth
        mergeFiles(finalServerFile);
        mergeFiles(hubServerFile);

        manageClient.putJson("/manage/v2/servers/Admin/properties?group-id=Default", node.toString());
        manageClient.putJson("/manage/v2/servers/App-Services/properties?group-id=Default", node.toString());
        manageClient.putJson("/manage/v2/servers/Manage/properties?group-id=Default", node.toString());

        try {
            Files.deleteIfExists(Paths.get(System.getProperty("java.io.tmpdir") + "/ssl-server.json"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

    }

    protected static File getResourceFile(String resourceName) {
        return new File(SSLsetup.class.getClassLoader().getResource(resourceName).getFile());
    }

    private String dhfCert() {
        return new String(
                "<certificate-template-properties xmlns=\"http://marklogic.com/manage\"> <template-name>dhf-cert</template-name><template-description>System Cert</template-description> <key-type>rsa</key-type><key-options/><req><version>0</version><subject><countryName>US</countryName><stateOrProvinceName>CA</stateOrProvinceName><commonName>*.marklogic.com</commonName><emailAddress>fbermude@marklogic.com</emailAddress><localityName>San Carlos</localityName><organizationName>MarkLogic</organizationName><organizationalUnitName>Engineering</organizationalUnitName></subject></req> </certificate-template-properties>");
    }

    private void mergeFiles(File file) {
        List<File> files = new ArrayList<>();
        files.add(new File(System.getProperty("java.io.tmpdir") + "/ssl-server.json"));
        Path serverPath = file.toPath();
        try {
            Files.list(serverPath).forEach(filePath -> {
                File server = filePath.toFile();
                files.add(server);

                try {
                    FileUtils.writeStringToFile(new File(System.getProperty("java.io.tmpdir") + "/" + server.getName()),
                            FileUtils.readFileToString(server));
                    ObjectNode serverFiles = (ObjectNode) JsonNodeUtil.mergeJsonFiles(files);
                    FileUtils.writeStringToFile(server, serverFiles.toString());
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            });
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
