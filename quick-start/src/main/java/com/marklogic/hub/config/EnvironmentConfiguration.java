package com.marklogic.hub.config;

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
	
	public String getServerPort() {
		return this.environment.getProperty("server.port");
	}
	
	
}
