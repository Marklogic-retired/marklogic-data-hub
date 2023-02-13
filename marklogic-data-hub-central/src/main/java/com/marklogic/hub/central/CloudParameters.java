package com.marklogic.hub.central;

import java.util.HashMap;
import java.util.Map;

public class CloudParameters {
    public static String ML_HOST = "localhost";
    public static int ML_REVERSE_PROXY_PORT = 443;
    public static String AUTHENTICATION_TYPE = "";
    public static String HC_BASE_PATH = "";
    public static String STAGING_BASE_PATH = "";
    public static String FINAL_BASE_PATH = "";
    public static String JOB_BASE_PATH = "";
    public static String MANAGE_BASE_PATH = "";
    public static String APP_SERVICES_BASE_PATH = "";
    public static String ADMIN_BASE_PATH = "";

    public static void updateCloudParameters(Map<String, String> cloudProperties) {
        ML_HOST = cloudProperties.get("mlHost");
        AUTHENTICATION_TYPE = cloudProperties.get("mlAuthentication");
        HC_BASE_PATH = cloudProperties.get("mlHcBasePath");
        STAGING_BASE_PATH = cloudProperties.get("mlStagingBasePath");
        FINAL_BASE_PATH = cloudProperties.get("mlFinalBasePath");
        JOB_BASE_PATH = cloudProperties.get("mlJobBasePath");
        MANAGE_BASE_PATH = cloudProperties.get("mlManageBasePath");
        APP_SERVICES_BASE_PATH = cloudProperties.get("mlAppServicesBasePath");
        ADMIN_BASE_PATH = cloudProperties.get("mlAdminBasePath");
    }
}
