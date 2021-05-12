package com.marklogic.hub.dataservices;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import static org.junit.Assert.fail;

public class VerifyEndpointPrivilegesTest extends AbstractHubCoreTest {

    /**
     * This could eventually become e.g. a Gradle task that prints out the set of DS modules and what privileges are
     * used to secure them.
     */
    @Test
    void verifyEachEndpointRequiresAPrivilege() {
        DatabaseClient modulesClient = getHubConfig().newModulesDbClient();
        final GenericDocumentManager mgr = modulesClient.newDocumentManager();
        final Map<String, List<String>> results = new TreeMap<>();
        EvalResultIterator iter = modulesClient.newServerEval()
            .xquery("" +
                "for $uri in cts:uri-match('/data-hub/5/data-services/**.api') " +
                "let $sjs-uri := fn:replace($uri, '.api', '.sjs') " +
                "let $xquery-uri := fn:replace($uri, '.api', '.xqy') " +
                "return if (fn:doc-available($sjs-uri)) then $sjs-uri else $xquery-uri"
            ).eval();

        try {
            iter.forEachRemaining(uri -> {
                final String uriString = uri.getString();
                String moduleContent = new String(mgr.read(uriString, new BytesHandle()).get());
                List<String> privileges = extractPrivileges(moduleContent);
                if (privileges.isEmpty()) {
                    fail("DS endpoint module does not call xdmp.securityAssert, nor does it have a comment starting with " +
                        "'// No privilege required:' stating why no privilege is required: " + uriString);
                }
                results.put(uriString, privileges);
            });
        } finally {
            iter.close();
            modulesClient.release();
        }

        // For JIRA consumption, print out the results
        System.out.println("||Filename||Required Privilege||");
        results.keySet().forEach(key -> {
            System.out.println("|" + key + "|" + String.join(", ", results.get(key)) + "|");
        });
    }

    /**
     * Expects something like:
     * <p>
     * xdmp.securityAssert("http://marklogic.com/data-hub/hub-central/privileges/download-project-files", "execute");
     *
     * @param moduleContent
     * @return
     */
    private List<String> extractPrivileges(String moduleContent) {
        List<String> privileges = new ArrayList<>();

        final String assertion = "xdmp.securityAssert(";
        final String xqueryAssertion = "xdmp:security-assert(";
        final String noPrivilegeRequired = "// No privilege required: ";

        for (String line : moduleContent.split("\n")) {
            line = line.trim();
            if (line.startsWith(assertion) || line.startsWith(xqueryAssertion)) {
                line = line.startsWith(assertion) ?
                    line.substring(assertion.length() + 1) :
                    line.substring(xqueryAssertion.length() + 1);
                line = line.replace("\", \"execute\");", "");

                int lastSlash = line.lastIndexOf("/");
                privileges.add(line.substring(lastSlash + 1));
            } else if (line.startsWith(noPrivilegeRequired)) {
                privileges.add(line.substring(noPrivilegeRequired.length()));
                break;
            }
        }
        return privileges;
    }
}
