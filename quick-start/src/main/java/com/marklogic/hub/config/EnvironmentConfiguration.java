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

	@Autowired
	private Environment environment;

	private Properties properties = new Properties();

	public String getServerPort() {
		return this.environment.getProperty("server.port");
	}

	public String getMLHost() {
		String value = this.properties.getProperty("mlHost");
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty("mlHost");
		if (value != null) {
			this.properties.setProperty("mlHost", value);
			return value;
		}
		return this.environment.getProperty("mlHost.default");
	}

	public String getMLUsername() {
		String value = this.properties.getProperty("mlUsername");
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty("mlUsername");
		if (value != null) {
			this.properties.setProperty("mlUsername", value);
			return value;
		}
		return this.environment.getProperty("mlUsername.default");
	}

	public String getMLPassword() {
		String value = this.properties.getProperty("mlPassword");
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty("mlPassword");
		if (value != null) {
			this.properties.setProperty("mlPassword", value);
			return value;
		}
		return this.environment.getProperty("mlPassword.default");
	}

	public String getMLRestPort() {
		String value = this.properties.getProperty("mlRestPort");
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty("mlRestPort");
		if (value != null) {
			this.properties.setProperty("mlRestPort", value);
			return value;
		}
		return this.environment.getProperty("mlRestPort.default");
	}

	public String getMLAuth() {
		String value = this.properties.getProperty("mlAuth");
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty("mlAuth");
		if (value != null) {
			this.properties.setProperty("mlAuth", value);
			return value;
		}
		return this.environment.getProperty("mlAuth.default");
	}
	
	public String getUserPluginDir() {
		String value = this.properties.getProperty("userPluginDir");
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty("userPluginDir");
		if (value != null) {
			this.properties.setProperty("userPluginDir", value);
			return value;
		}
		return this.environment.getProperty("userPluginDir.default");
	}
	
	public String getMlcpHomeDir() {
	    String value = this.properties.getProperty("mlcpHome");
	    if (value != null) {
	        return value;
	    }
	    value = this.environment.getProperty("mlcpHome");
	    if (value != null) {
	        this.properties.setProperty("userPluginDir", value);
	        return value;
	    }
	    return "./mlcp";
	}

	public void setMLHost(String mlHost) {
		this.properties.setProperty("mlHost", mlHost);
	}

	public void setMLRestPort(String mlRestPort) {
		this.properties.setProperty("mlRestPort", mlRestPort);
	}

	public void setMLUsername(String mlUsername) {
		this.properties.setProperty("mlUsername", mlUsername);
	}

	public void setMLPassword(String mlPassword) {
		this.properties.setProperty("mlPassword", mlPassword);
	}
	
	public void setUserPluginDir(String userPluginDir) {
		this.properties.setProperty("userPluginDir", userPluginDir);
	}
	
	public void setMlcpHome(String mlcpHomeDir) {
	    this.properties.setProperty("mlcpHome", mlcpHomeDir);
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
