package com.marklogic.hub.config;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/***
 * 
 * @author mturiana
 *	This class is used to get the value of the keys in application.properties
 */
@Component
public class EnvironmentConfiguration {

	@Autowired
	private Environment environment;
	
	private Properties properties = new Properties();
	
	public String getServerPort() {
		return this.environment.getProperty("server.port");
	}
	
	
	public String getMLHost() {
		return this.properties.getProperty("mlHost");
	}
	
	public String getMLUserName() {
		return this.properties.getProperty("mlUsername");
	}
	
	public String getMLPassword() {
		return this.properties.getProperty("mlPassword");
	}
	
	public void setMLHost(String mlHost) {
		this.properties.setProperty("mlHost", mlHost);
	}
	
	public void setMLUserName(String mlUsername) {
		this.properties.setProperty("mlUsername", mlUsername);
	}
	
	public void setMLPassword(String mlPassword) {
		this.properties.setProperty("mlPassword", mlPassword);
	}
	
	
}
