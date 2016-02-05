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
		if (value == null) {
			value = this.environment.getProperty("mlHost.default");
		}
		return value;
	}

	public String getMLUsername() {
		String value = this.properties.getProperty("mlUsername");
		if (value == null) {
			value = this.environment.getProperty("mlUsername.default");
		}
		return value;
	}

	public String getMLPassword() {
		String value = this.properties.getProperty("mlPassword");
		if (value == null) {
			value = this.environment.getProperty("mlPassword.default");
		}
		return value;
	}

	public String getMLRestPort() {
		String value = this.properties.getProperty("mlRestPort");
		if (value == null) {
			value = this.environment.getProperty("mlRestPort.default");
		}
		return value;
	}

	public String getMLAuth() {
		String value = this.properties.getProperty("mlAuth");
		if (value == null) {
			value = this.environment.getProperty("mlAuth.default");
		}
		return value;
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

}
