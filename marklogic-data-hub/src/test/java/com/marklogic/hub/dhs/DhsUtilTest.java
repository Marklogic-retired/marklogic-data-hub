package com.marklogic.hub.dhs;

import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import org.junit.jupiter.api.Test;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DhsUtilTest {

    @Test
    void updateAdminConfig() {
        AdminConfig config = new AdminConfig();
        config.setScheme("http");
        config.setConfigureSimpleSsl(false);

        Properties props = new Properties();
        props.setProperty("mlAdminScheme", "https");
        props.setProperty("mlAdminSimpleSsl", "true");

        DhsUtil.updateAdminConfig(config, props);
        assertEquals("https", config.getScheme());
        assertTrue(config.isConfigureSimpleSsl());
    }

    @Test
    void updateManageConfig() {
        ManageConfig config = new ManageConfig();
        config.setScheme("http");
        config.setConfigureSimpleSsl(false);

        Properties props = new Properties();
        props.setProperty("mlManageScheme", "https");
        props.setProperty("mlManageSimpleSsl", "true");

        DhsUtil.updateManageConfig(config, props);
        assertEquals("https", config.getScheme());
        assertTrue(config.isConfigureSimpleSsl());
    }
}
