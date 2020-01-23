package com.marklogic.hub.dhs;

import com.marklogic.mgmt.DefaultManageConfigFactory;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.admin.AdminConfig;
import com.marklogic.mgmt.admin.DefaultAdminConfigFactory;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Properties;
import java.util.function.BiConsumer;

/**
 * Helper methods for logic common across installing DHF in DHS and deploying user resources to DHS.
 */
public abstract class DhsUtil {

    /**
     * Assumes that SSL should be used for connecting to MarkLogic.
     *
     * @param props
     */
    public static void addDhsSpecificProperties(Properties props) {
        addDhsSpecificProperties(props, false);
    }

    /**
     * Each of these properties is assumed to be true when connecting to a DHS instance.
     *
     * @param props
     * @param disableSsl
     */
    public static void addDhsSpecificProperties(Properties props, boolean disableSsl) {
        // ml-gradle properties
        props.setProperty("mlAppServicesPort", "8010");
        props.setProperty("mlAppServicesAuthentication", "basic");
        props.setProperty("mlModulePermissions",
            "data-hub-module-reader,read,data-hub-module-reader,execute,data-hub-environment-manager,update,rest-extension-user,execute");

        // DHF properties
        props.setProperty("mlIsHostLoadBalancer", "true");
        props.setProperty("mlIsProvisionedEnvironment", "true");
        props.setProperty("mlFlowDeveloperRole", "flowDeveloper");
        props.setProperty("mlFlowOperatorRole", "flowOperator");
        props.setProperty("mlFinalAuth", "basic");
        props.setProperty("mlJobAuth", "basic");
        props.setProperty("mlStagingAuth", "basic");

        if (!disableSsl) {
            setDefaultPropertiesForSecureConnections(props);
        } else {
            LoggerFactory.getLogger(DhsUtil.class).info("Not setting default property values for secure connections to MarkLogic");
        }
    }

    /**
     * As of DHS 2.6.0, all connections to DHS require secure connections. This method then configures both
     * ml-app-deployer and DHF properties to use secure connections. In addition, all DatabaseClient connections
     * default to using basic security, again per DHF 2.6.0.
     * <p>
     * In an ml-gradle context, the Admin and Manage objects have already been constructed. That means that in addition
     * to setting these properties (which needs to happen for the DHF installer, we also need to modify mlAdminConfig
     * and mlManageConfig and then re-set them on mlAdminManager and mlManageClient. I think we can do that safely
     * by running the properties (which is both ml-gradle props and the stuff set here) via their respective property
     * consumer maps so that we modify the in-place ml* objects.
     * <p>
     * So for DHS tasks, we first need to apply all of the properties. Then, we need to
     *
     * @param props
     */
    protected static void setDefaultPropertiesForSecureConnections(Properties props) {
        // ml-gradle properties
        props.setProperty("mlAdminScheme", "https");
        props.setProperty("mlAdminSimpleSsl", "true");
        props.setProperty("mlManageScheme", "https");
        props.setProperty("mlManageSimpleSsl", "true");
        props.setProperty("mlAppServicesSimpleSsl", "true");

        // DHF properties
        props.setProperty("mlFinalSimpleSsl", "true");
        props.setProperty("mlJobSimpleSsl", "true");
        props.setProperty("mlStagingSimpleSsl", "true");
    }

    /**
     * Update the given AdminConfig based on the given Properties, and then apply this
     *
     * @param config
     * @param props
     */
    public static void updateAdminConfig(AdminConfig config, Properties props) {
        Map<String, BiConsumer<AdminConfig, String>> map = new DefaultAdminConfigFactory().getPropertyConsumerMap();
        for (String propertyName : map.keySet()) {
            String value = props.getProperty(propertyName);
            if (StringUtils.isNotEmpty(value)) {
                map.get(propertyName).accept(config, value);
            }
        }
    }

    /**
     * Intended to be invoked by the DHF Gradle plugin hubConfig has been initialized. This logic isn't specific to
     * DHS, but the need to do it is, and that's why it lives in this class.
     *
     * @param config
     * @param props
     */
    public static void updateManageConfig(ManageConfig config, Properties props) {
        Map<String, BiConsumer<ManageConfig, String>> map = new DefaultManageConfigFactory().getPropertyConsumerMap();
        for (String propertyName : map.keySet()) {
            String value = props.getProperty(propertyName);
            if (StringUtils.isNotEmpty(value)) {
                map.get(propertyName).accept(config, value);
            }
        }
    }
}
