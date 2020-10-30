package com.marklogic.hub.spark.sql.sources.v2;

import com.marklogic.hub.HubClientConfig;

import java.util.Map;
import java.util.Properties;

public abstract class Util {

    public static HubClientConfig buildHubClientConfig(Map<String, String> options) {
        Properties props = new Properties();
        // Assume DHS usage by default; the options map can override these
        props.setProperty("hubdhs", "true");
        props.setProperty("hubssl", "true");
        options.keySet().forEach(key -> props.setProperty(key, options.get(key)));

        HubClientConfig hubClientConfig = new HubClientConfig();
        hubClientConfig.registerLowerCasedPropertyConsumers();
        hubClientConfig.applyProperties(props);
        return hubClientConfig;
    }
    
}
