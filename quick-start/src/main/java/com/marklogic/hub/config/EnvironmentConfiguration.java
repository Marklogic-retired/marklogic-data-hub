package com.marklogic.hub.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/***
 *
 * @author mturiana This class is used to get the value of the keys in
 *         application.properties
 */
@Component
public class EnvironmentConfiguration {

	private static final Logger LOGGER = LoggerFactory
			.getLogger(EnvironmentConfiguration.class);

	private static final String PROPERTIES_FILENAME = "environment.properties";
	private static final String DEFAULT_SUFFIX = ".default";
	private static final String SERVER_PORT = "server.port";
	private static final String ML_HOST = "mlHost";
	private static final String ML_USERNAME = "mlUsername";
	private static final String ML_PASSWORD = "mlPassword";
	private static final String ML_STAGING_REST_PORT = "mlStagingRestPort";
	private static final String ML_FINAL_REST_PORT = "mlFinalRestPort";
	private static final String ML_AUTH = "mlAuth";
	private static final String USER_PLUGIN_DIR = "userPluginDir";
	private static final String ASSET_INSTALL_TIME_FILE = "assetInstallTimeFile";

	@Autowired
	private Environment environment;

	private Properties properties = new Properties();

	public String getServerPort() {
		return this.environment.getProperty(SERVER_PORT);
	}

	public String getMLHost() {
		String value = this.properties.getProperty(ML_HOST);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_HOST);
		if (value != null) {
			this.properties.setProperty(ML_HOST, value);
			return value;
		}
		return this.environment.getProperty(ML_HOST + DEFAULT_SUFFIX);
	}

	public String getMLUsername() {
		String value = this.properties.getProperty(ML_USERNAME);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_USERNAME);
		if (value != null) {
			this.properties.setProperty(ML_USERNAME, value);
			return value;
		}
		return this.environment.getProperty(ML_USERNAME + DEFAULT_SUFFIX);
	}

	public String getMLPassword() {
		String value = this.properties.getProperty("mlPassword");
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_PASSWORD);
		if (value != null) {
			this.properties.setProperty(ML_PASSWORD, value);
			return value;
		}
		return this.environment.getProperty(ML_PASSWORD + DEFAULT_SUFFIX);
	}

	public String getMLStagingRestPort() {
		String value = this.properties.getProperty(ML_STAGING_REST_PORT);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_STAGING_REST_PORT);
		if (value != null) {
			this.properties.setProperty(ML_STAGING_REST_PORT, value);
			return value;
		}
		return this.environment.getProperty(ML_STAGING_REST_PORT + DEFAULT_SUFFIX);
	}

    public String getMLFinalRestPort() {
        String value = this.properties.getProperty(ML_FINAL_REST_PORT);
        if (value != null) {
            return value;
        }
        value = this.environment.getProperty(ML_FINAL_REST_PORT);
        if (value != null) {
            this.properties.setProperty(ML_FINAL_REST_PORT, value);
            return value;
        }
        return this.environment.getProperty(ML_FINAL_REST_PORT + DEFAULT_SUFFIX);
    }

	public String getMLAuth() {
		String value = this.properties.getProperty(ML_AUTH);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(ML_AUTH);
		if (value != null) {
			this.properties.setProperty(ML_AUTH, value);
			return value;
		}
		return this.environment.getProperty(ML_AUTH + DEFAULT_SUFFIX);
	}

	public String getUserPluginDir() {
		String value = this.properties.getProperty(USER_PLUGIN_DIR);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(USER_PLUGIN_DIR);
		if (value != null) {
			this.properties.setProperty(USER_PLUGIN_DIR, value);
			return value;
		}
		return this.environment.getProperty(USER_PLUGIN_DIR + DEFAULT_SUFFIX);
	}

	public String getAssetInstallTimeFilePath() {
	    String value = this.properties.getProperty(ASSET_INSTALL_TIME_FILE);
	    if (value != null) {
	        return value;
	    }
	    value = this.environment.getProperty(ASSET_INSTALL_TIME_FILE);
	    if (value != null) {
	        this.properties.setProperty(ASSET_INSTALL_TIME_FILE, value);
	        return value;
	    }
	    return "./assetInstallTime.properties";
	}

	public void setMLHost(String mlHost) {
		this.properties.setProperty(ML_HOST, mlHost);
	}

	public void setMLStagingRestPort(String mlStagingRestPort) {
		this.properties.setProperty(ML_STAGING_REST_PORT, mlStagingRestPort);
	}
	
	public void setMLFinalRestPort(String mlFinalRestPort) {
        this.properties.setProperty(ML_FINAL_REST_PORT, mlFinalRestPort);
    }

	public void setMLUsername(String mlUsername) {
		this.properties.setProperty(ML_USERNAME, mlUsername);
	}

	public void setMLPassword(String mlPassword) {
		this.properties.setProperty(ML_PASSWORD, mlPassword);
	}

	public void setUserPluginDir(String userPluginDir) {
		this.properties.setProperty(USER_PLUGIN_DIR, userPluginDir);
	}

	public void setAssetInstallTimeFilePath(String assetInstallTimeFilePath) {
	    this.properties.setProperty(ASSET_INSTALL_TIME_FILE, assetInstallTimeFilePath);
	}

	public void loadConfigurationFromFile() {
	    InputStream is = null;
	    try {
	        File file = new File(PROPERTIES_FILENAME);
	        if(file.exists()) {
	        	is = new FileInputStream( file );
	        	properties.load( is );
	        }
	    } catch ( Exception e ) {
	    	is = null;
	    }
	}

	public void saveConfigurationToFile() {
		OutputStream out = null;
		try {
			out = new FileOutputStream(new File(PROPERTIES_FILENAME));
			this.properties.store(out, null);
		} catch (FileNotFoundException e) {
			LOGGER.error("environment.properties is not found", e.getMessage());
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

	public void removeSavedConfiguration() {
		this.properties = new Properties();
	    File file = new File(PROPERTIES_FILENAME);
	    if(file.exists()) {
	    	file.delete();
	    }
	}

}
