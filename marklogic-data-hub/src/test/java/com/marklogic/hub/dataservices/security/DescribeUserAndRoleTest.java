package com.marklogic.hub.dataservices.security;

import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.SecurityService;
import com.marklogic.hub.util.JacksonUtil;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * These are just smoke tests; extensive coverage of the endpoints is in marklogic-unit-test modules.
 */
public class DescribeUserAndRoleTest extends AbstractHubCoreTest {

    @Test
    void asDataHubDeveloper() {
        verifyEndpointsWork();
    }

    @Test
    void asMinimalUser() {
        runAsTestUserWithRoles("data-hub-user-reader", "data-hub-common");
        verifyEndpointsWork();
    }

    @Test
    void asUserWithoutPrivilege() {
        runAsDataHubOperator();
        verifyUserIsForbiddenTo(() -> verifyEndpointsWork(), "The operator role is not expected to have the " +
            "privileges granted by data-hub-user-reader");
    }

    private void verifyEndpointsWork() {
        SecurityService service = SecurityService.on(getHubClient().getFinalClient());

        JsonNode userResponse = service.describeUser("test-describe-user");
        assertEquals("test-describe-user", userResponse.get("username").asText());

        JsonNode roleResponse = service.describeRole("test-describe-role");
        assertEquals("test-describe-role", roleResponse.get("roleName").asText());

        DefaultPrettyPrinter dpp = new DefaultPrettyPrinter();
        dpp.indentArraysWith(DefaultIndenter.SYSTEM_LINEFEED_INSTANCE);
        objectMapper.setDefaultPrettyPrinter(dpp);
        try {
            JacksonUtil.newWriterWithSeparateLinesForArrayValues().writeValue(System.out, roleResponse);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
