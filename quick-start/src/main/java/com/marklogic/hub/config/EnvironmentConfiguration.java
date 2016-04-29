package com.marklogic.hub.config;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Paths;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import com.google.common.base.Charsets;
import com.google.common.io.Files;
import com.marklogic.hub.HubConfig;

/***
 *
 * @author mturiana
 *
 * This class is used to get the value of the keys from the properties file
 */
@Component
public class EnvironmentConfiguration {

	private static final Logger LOGGER = LoggerFactory
			.getLogger(EnvironmentConfiguration.class);

	private static final String ENVIRONMENT_PROPERTIES_FILENAME = "environment.properties";
	private static final String DEFAULT_SUFFIX = ".default";
	private static final String SERVER_PORT = "server.port";
	private static final String ML_HOST = "mlHost";
	private static final String ML_USERNAME = "mlUsername";
	private static final String ML_PASSWORD = "mlPassword";
	private static final String ML_STAGING_REST_PORT = "mlStagingPort";
	private static final String ML_FINAL_REST_PORT = "mlFinalPort";
	private static final String ML_TRACE_REST_PORT = "mlTracePort";
	private static final String ML_AUTH = "mlAuth";
	private static final String USER_PLUGIN_DIR = "userPluginDir";
	private static final String ASSET_INSTALL_TIME_FILE = "assetInstallTimeFile";

	@Autowired
	private Environment environment;

	private Properties environmentProperties = new Properties();

	public String getServerPort() {
		return this.environment.getProperty(SERVER_PORT);
	}

	public String getMLHost() {
		String value = this.environmentProperties.getProperty(ML_HOST);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_HOST);
		if (value != null) {
			this.environmentProperties.setProperty(ML_HOST, value);
			return value;
		}
		return this.environment.getProperty(ML_HOST + DEFAULT_SUFFIX);
	}

	public String getMLUsername() {
		String value = this.environmentProperties.getProperty(ML_USERNAME);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_USERNAME);
		if (value != null) {
			this.environmentProperties.setProperty(ML_USERNAME, value);
			return value;
		}
		return this.environment.getProperty(ML_USERNAME + DEFAULT_SUFFIX);
	}

	public String getMLPassword() {
		String value = this.environmentProperties.getProperty("mlPassword");
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_PASSWORD);
		if (value != null) {
			this.environmentProperties.setProperty(ML_PASSWORD, value);
			return value;
		}
		return this.environment.getProperty(ML_PASSWORD + DEFAULT_SUFFIX);
	}

	public String getMLStagingPort() {
		String value = this.environmentProperties.getProperty(ML_STAGING_REST_PORT);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_STAGING_REST_PORT);
		if (value != null) {
			this.environmentProperties.setProperty(ML_STAGING_REST_PORT, value);
			return value;
		}
		return this.environment.getProperty(ML_STAGING_REST_PORT + DEFAULT_SUFFIX);
	}

    public String getMLFinalPort() {
        String value = this.environmentProperties.getProperty(ML_FINAL_REST_PORT);
        if (value != null) {
            return value;
        }
        value = this.environment.getProperty(ML_FINAL_REST_PORT);
        if (value != null) {
            this.environmentProperties.setProperty(ML_FINAL_REST_PORT, value);
            return value;
        }
        return this.environment.getProperty(ML_FINAL_REST_PORT + DEFAULT_SUFFIX);
    }

    public String getMLTracePort() {
        String value = this.environmentProperties.getProperty(ML_TRACE_REST_PORT);
        if (value != null) {
            return value;
        }
        value = this.environment.getProperty(ML_TRACE_REST_PORT);
        if (value != null) {
            this.environmentProperties.setProperty(ML_TRACE_REST_PORT, value);
            return value;
        }
        return this.environment.getProperty(ML_TRACE_REST_PORT + DEFAULT_SUFFIX);
    }

	public String getMLAuth() {
		String value = this.environmentProperties.getProperty(ML_AUTH);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_AUTH);
		if (value != null) {
			this.environmentProperties.setProperty(ML_AUTH, value);
			return value;
		}
		return this.environment.getProperty(ML_AUTH + DEFAULT_SUFFIX);
	}

	public String getUserPluginDir() {
		String value = this.environmentProperties.getProperty(USER_PLUGIN_DIR);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(USER_PLUGIN_DIR);
		if (value != null) {
			this.environmentProperties.setProperty(USER_PLUGIN_DIR, value);
			return value;
		}
		return this.environment.getProperty(USER_PLUGIN_DIR + DEFAULT_SUFFIX);
	}

	public String getAssetInstallTimeFilePath() {
	    String value = this.environmentProperties.getProperty(ASSET_INSTALL_TIME_FILE);
	    if (value != null) {
	        return value;
	    }
	    value = this.environment.getProperty(ASSET_INSTALL_TIME_FILE);
	    if (value != null) {
	        this.environmentProperties.setProperty(ASSET_INSTALL_TIME_FILE, value);
	        return value;
	    }
	    return "./assetInstallTime.properties";
	}

	public void setMLHost(String mlHost) {
		this.environmentProperties.setProperty(ML_HOST, mlHost);
	}

	public void setMLStagingPort(String mlStagingPort) {
		this.environmentProperties.setProperty(ML_STAGING_REST_PORT, mlStagingPort);
	}

	public void setMLFinalPort(String mlFinalPort) {
        this.environmentProperties.setProperty(ML_FINAL_REST_PORT, mlFinalPort);
    }

	public void setMlTracePort(String mlTracePort) {
	    this.environmentProperties.setProperty(ML_TRACE_REST_PORT, mlTracePort);
	}

	public void setMLUsername(String mlUsername) {
		this.environmentProperties.setProperty(ML_USERNAME, mlUsername);
	}

	public void setMLPassword(String mlPassword) {
		this.environmentProperties.setProperty(ML_PASSWORD, mlPassword);
	}

	public void setUserPluginDir(String userPluginDir) {
		this.environmentProperties.setProperty(USER_PLUGIN_DIR, userPluginDir);
	}

	public void setAssetInstallTimeFilePath(String assetInstallTimeFilePath) {
	    this.environmentProperties.setProperty(ASSET_INSTALL_TIME_FILE, assetInstallTimeFilePath);
	}

	public void loadConfigurationFromFiles() {
	    loadConfigurationFromFile(environmentProperties, ENVIRONMENT_PROPERTIES_FILENAME);
	}

	public void loadConfigurationFromFile(Properties configProperties, String fileName) {
        InputStream is = null;
        try {
            File file = new File(fileName);
            if(file.exists()) {
                is = new FileInputStream( file );
                configProperties.load( is );
            }
        } catch ( Exception e ) {
            is = null;
        }
    }

	public void saveConfigurationToFile() {
		saveConfigurationToFile(environmentProperties, ENVIRONMENT_PROPERTIES_FILENAME);
	}

	private void saveConfigurationToFile(Properties configProperties, String fileName) {
        OutputStream out = null;
        try {
            out = new FileOutputStream(new File(fileName));
            configProperties.store(out, null);
        } catch (FileNotFoundException e) {
            LOGGER.error(fileName + " is not found", e.getMessage());
        } catch (IOException e) {
            LOGGER.error("Error saving configuration.", e.getMessage());
        } finally {
            if (out != null) {
                try {
                    out.close();
                } catch (IOException e) {
                    LOGGER.error("Error closing output stream.", e.getMessage());
                }
            }
        }
    }

	public void saveOrUpdateFlowMlcpOptionsToFile(String entityName, String flowName, String mlcpOptionsFileContent) throws IOException {
	    String filePath = getMlcpOptionsFilePath(entityName, flowName);
	    FileWriter fw = new FileWriter(filePath);
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(mlcpOptionsFileContent);
        bw.close();
    }

	private String getMlcpOptionsFilePath(String entityName, String flowName) {
	    return "." + File.separator + entityName + "-" + flowName + ".txt";
    }

    public String getFlowMlcpOptionsFromFile(String entityName, String flowName) throws IOException {
        String filePath = getMlcpOptionsFilePath(entityName, flowName);
        File file = new File(filePath);
	    if(file.exists()) {
	        return Files.toString(file, Charsets.UTF_8);
	    }
	    String currentDirectory = Paths.get("").toAbsolutePath().toString();
	    return "{ \"input_file_path\": \"" + currentDirectory + "\" }";
    }

	public HubConfig getHubConfig() {
	    HubConfig hubConfig = new HubConfig();
	    hubConfig.host = getMLHost();
	    hubConfig.stagingPort = Integer.parseInt(getMLStagingPort());
	    hubConfig.finalPort = Integer.parseInt(getMLFinalPort());
	    hubConfig.tracePort = Integer.parseInt(getMLTracePort());
	    hubConfig.adminUsername = getMLUsername();
	    hubConfig.adminPassword = getMLPassword();
	    return hubConfig;
	}

}
