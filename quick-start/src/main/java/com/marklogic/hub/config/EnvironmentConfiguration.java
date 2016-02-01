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
		String value = this.properties.getProperty("mlHost");
		if(value == null) {
			value = this.environment.getProperty("mlHost.default");
		}
		return value;
	}
	
	public String getMLUsername() {
		String value = this.properties.getProperty("mlUsername");
		if(value == null) {
			value = this.environment.getProperty("mlUsername.default");
		}
		return value;
	}
	
	public String getMLPassword() {
		String value = this.properties.getProperty("mlPassword");
		if(value == null) {
			value = this.environment.getProperty("mlPassword.default");
		}
		return value;
	}
	
	public String getMLRestPort() {
		String value = this.properties.getProperty("mlRestPort");
		if(value == null) {
			value = this.environment.getProperty("mlRestPort.default");
		}
		return value;
	}
	
	public String getMLAuth() {
		String value = this.properties.getProperty("mlAuth");
		if(value == null) {
			value = this.environment.getProperty("mlAuth.default");
		}
		return value;
	}
	
	public void setMLHost(String mlHost) {
		this.properties.setProperty("mlHost", mlHost);
	}
	
	public void setMLUsername(String mlUsername) {
		this.properties.setProperty("mlUsername", mlUsername);
	}
	
	public void setMLPassword(String mlPassword) {
		this.properties.setProperty("mlPassword", mlPassword);
	}
	
	
}
