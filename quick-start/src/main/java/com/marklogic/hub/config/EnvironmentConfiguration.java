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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.DatabaseClientFactory.Authentication;
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

	private static final String GRADLE_PROPERTIES_FILENAME = "gradle.properties";
	private static final String LOCAL_PROPERTIES_FILENAME = "local.properties";
	private static final String DEFAULT_SUFFIX = ".default";
	private static final String SERVER_PORT = "server.port";
	private static final String ML_HOST = "mlHost";
	private static final String ML_USERNAME = "mlUsername";
	private static final String ML_PASSWORD = "mlPassword";
	private static final String ML_STAGING_APPSERVER_NAME = "mlStagingAppserverName";
	private static final String ML_FINAL_APPSERVER_NAME = "mlFinalAppserverName";
	private static final String ML_TRACE_APPSERVER_NAME = "mlTraceAppserverName";

	private static final String ML_STAGING_REST_PORT = "mlStagingPort";
	private static final String ML_FINAL_REST_PORT = "mlFinalPort";
	private static final String ML_TRACE_REST_PORT = "mlTracePort";

    private static final String ML_STAGING_DATABASE_NAME = "mlStagingDbName";
    private static final String ML_FINAL_DATABASE_NAME = "mlFinalDbName";
    private static final String ML_TRACE_DATABASE_NAME = "mlTraceDbName";

    private static final String ML_STAGING_FORESTS_PER_HOST = "mlStagingForestsPerHost";
    private static final String ML_FINAL_FORESTS_PER_HOST = "mlFinalForestsPerHost";
    private static final String ML_TRACE_FORESTS_PER_HOST = "mlTraceForestsPerHost";

    private static final String ML_MODULES_DATABASE_NAME = "mlModulesDbName";
    private static final String ML_TRIGGERS_DATABASE_NAME = "mlTriggersDbName";
    private static final String ML_SCHEMAS_DATABASE_NAME = "mlSchemasDbName";

	private static final String ML_AUTH = "mlAuth";
	private static final String PROJECT_DIR = "projectDir";

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

   public String getMLStagingAppserverName() {
        String value = this.environmentProperties.getProperty(ML_STAGING_APPSERVER_NAME);
        if (value != null) {
            return value;
        }
        value = this.environment.getProperty(ML_STAGING_APPSERVER_NAME);
        if (value != null) {
            this.environmentProperties.setProperty(ML_STAGING_APPSERVER_NAME, value);
            return value;
        }
        return this.environment.getProperty(ML_STAGING_APPSERVER_NAME + DEFAULT_SUFFIX);
    }

   public String getMLFinalAppserverName() {
       String value = this.environmentProperties.getProperty(ML_FINAL_APPSERVER_NAME);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_FINAL_APPSERVER_NAME);
       if (value != null) {
           this.environmentProperties.setProperty(ML_FINAL_APPSERVER_NAME, value);
           return value;
       }
       return this.environment.getProperty(ML_FINAL_APPSERVER_NAME + DEFAULT_SUFFIX);
   }

   public String getMLTraceAppserverName() {
       String value = this.environmentProperties.getProperty(ML_TRACE_APPSERVER_NAME);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_TRACE_APPSERVER_NAME);
       if (value != null) {
           this.environmentProperties.setProperty(ML_TRACE_APPSERVER_NAME, value);
           return value;
       }
       return this.environment.getProperty(ML_TRACE_APPSERVER_NAME + DEFAULT_SUFFIX);
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

   public String getMLStagingDatabaseName() {
        String value = this.environmentProperties.getProperty(ML_STAGING_DATABASE_NAME);
        if (value != null) {
            return value;
        }
        value = this.environment.getProperty(ML_STAGING_DATABASE_NAME);
        if (value != null) {
            this.environmentProperties.setProperty(ML_STAGING_DATABASE_NAME, value);
            return value;
        }
        return this.environment.getProperty(ML_STAGING_DATABASE_NAME + DEFAULT_SUFFIX);
    }

   public String getMLFinalDatabaseName() {
       String value = this.environmentProperties.getProperty(ML_FINAL_DATABASE_NAME);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_FINAL_DATABASE_NAME);
       if (value != null) {
           this.environmentProperties.setProperty(ML_FINAL_DATABASE_NAME, value);
           return value;
       }
       return this.environment.getProperty(ML_FINAL_DATABASE_NAME + DEFAULT_SUFFIX);
   }

   public String getMLTraceDatabaseName() {
       String value = this.environmentProperties.getProperty(ML_TRACE_DATABASE_NAME);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_TRACE_DATABASE_NAME);
       if (value != null) {
           this.environmentProperties.setProperty(ML_TRACE_DATABASE_NAME, value);
           return value;
       }
       return this.environment.getProperty(ML_TRACE_DATABASE_NAME + DEFAULT_SUFFIX);
   }

   public String getMLStagingForestsPerHost() {
        String value = this.environmentProperties.getProperty(ML_STAGING_FORESTS_PER_HOST);
        if (value != null) {
            return value;
        }
        value = this.environment.getProperty(ML_STAGING_FORESTS_PER_HOST);
        if (value != null) {
            this.environmentProperties.setProperty(ML_STAGING_FORESTS_PER_HOST, value);
            return value;
        }
        return this.environment.getProperty(ML_STAGING_FORESTS_PER_HOST + DEFAULT_SUFFIX);
    }

   public String getMLFinalForestsPerHost() {
       String value = this.environmentProperties.getProperty(ML_FINAL_FORESTS_PER_HOST);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_FINAL_FORESTS_PER_HOST);
       if (value != null) {
           this.environmentProperties.setProperty(ML_FINAL_FORESTS_PER_HOST, value);
           return value;
       }
       return this.environment.getProperty(ML_FINAL_FORESTS_PER_HOST + DEFAULT_SUFFIX);
   }

   public String getMLTraceForestsPerHost() {
       String value = this.environmentProperties.getProperty(ML_TRACE_FORESTS_PER_HOST);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_TRACE_FORESTS_PER_HOST);
       if (value != null) {
           this.environmentProperties.setProperty(ML_TRACE_FORESTS_PER_HOST, value);
           return value;
       }
       return this.environment.getProperty(ML_TRACE_FORESTS_PER_HOST + DEFAULT_SUFFIX);
   }

   public String getMLModulesDatabaseName() {
       String value = this.environmentProperties.getProperty(ML_MODULES_DATABASE_NAME);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_MODULES_DATABASE_NAME);
       if (value != null) {
           this.environmentProperties.setProperty(ML_MODULES_DATABASE_NAME, value);
           return value;
       }
       return this.environment.getProperty(ML_MODULES_DATABASE_NAME + DEFAULT_SUFFIX);
   }

   public String getMLTriggersDatabaseName() {
       String value = this.environmentProperties.getProperty(ML_TRIGGERS_DATABASE_NAME);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_TRIGGERS_DATABASE_NAME);
       if (value != null) {
           this.environmentProperties.setProperty(ML_TRIGGERS_DATABASE_NAME, value);
           return value;
       }
       return this.environment.getProperty(ML_TRIGGERS_DATABASE_NAME + DEFAULT_SUFFIX);
   }

   public String getMLSchemasDatabaseName() {
       String value = this.environmentProperties.getProperty(ML_SCHEMAS_DATABASE_NAME);
       if (value != null) {
           return value;
       }
       value = this.environment.getProperty(ML_SCHEMAS_DATABASE_NAME);
       if (value != null) {
           this.environmentProperties.setProperty(ML_SCHEMAS_DATABASE_NAME, value);
           return value;
       }
       return this.environment.getProperty(ML_SCHEMAS_DATABASE_NAME + DEFAULT_SUFFIX);
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

	public String getProjectDir() {
		String value = this.environmentProperties.getProperty(PROJECT_DIR);
		if (value != null) {
			return value;
		}
		value = this.environment.getProperty(PROJECT_DIR);
		if (value != null) {
			this.environmentProperties.setProperty(PROJECT_DIR, value);
			return value;
		}
		return this.environment.getProperty(PROJECT_DIR + DEFAULT_SUFFIX);
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

	public void setProjectDir(String projectDir) {
		this.environmentProperties.setProperty(PROJECT_DIR, projectDir);
	}

	public void loadConfigurationFromFiles() {
	    loadConfigurationFromFile(environmentProperties, GRADLE_PROPERTIES_FILENAME);
	    String environment = System.getenv("environmentName");
	    if (environment == null) {
	        environment = "local";
	    }
	    String envPropertiesFile = "gradle-" + environment + ".properties";
	    LOGGER.info("envPropertiesFile = " + envPropertiesFile);
	    loadConfigurationFromFile(environmentProperties, envPropertiesFile);
	    LOGGER.info(environmentProperties.toString());
	}

	public void loadConfigurationFromFile(Properties configProperties, String fileName) {
        InputStream is = null;
        try {
            File file = new File(fileName);
            if(file.exists()) {
                is = new FileInputStream( file );
                configProperties.load( is );
                is.close();
            }
        } catch ( Exception e ) {
            is = null;
        }
    }

	public void saveConfigurationToFile() {
		saveConfigurationToFile(environmentProperties, LOCAL_PROPERTIES_FILENAME);
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
        hubConfig.stagingHttpName = getMLStagingAppserverName();
        hubConfig.finalHttpName = getMLFinalAppserverName();
	    hubConfig.tracingHttpName = getMLTraceAppserverName();
	    hubConfig.stagingPort = Integer.parseInt(getMLStagingPort());
	    hubConfig.finalPort = Integer.parseInt(getMLFinalPort());
	    hubConfig.tracePort = Integer.parseInt(getMLTracePort());
        hubConfig.stagingDbName = getMLStagingDatabaseName();
        hubConfig.finalDbName = getMLFinalDatabaseName();
        hubConfig.tracingDbName = getMLTraceDatabaseName();
        hubConfig.stagingForestsPerHost = Integer.parseInt(getMLStagingForestsPerHost());
        hubConfig.finalForestsPerHost = Integer.parseInt(getMLFinalForestsPerHost());
        hubConfig.tracingForestsPerHost = Integer.parseInt(getMLTraceForestsPerHost());
        hubConfig.modulesDbName = getMLModulesDatabaseName();
        hubConfig.triggersDbName = getMLTriggersDatabaseName();
        hubConfig.schemasDbName = getMLSchemasDatabaseName();
	    hubConfig.adminUsername = getMLUsername();
	    hubConfig.adminPassword = getMLPassword();
	    hubConfig.projectDir = getProjectDir();
	    return hubConfig;
	}

	public DatabaseClient getStagingClient() {
        Authentication authMethod = Authentication
                .valueOf(getMLAuth().toUpperCase());

        DatabaseClient client = DatabaseClientFactory.newClient(
                getMLHost(),
                Integer.parseInt(getMLStagingPort()),
                getMLUsername(),
                getMLPassword(), authMethod);
        return client;
	}

	public DatabaseClient getFinalClient() {
	    Authentication authMethod = Authentication
	            .valueOf(getMLAuth().toUpperCase());

        DatabaseClient client = DatabaseClientFactory.newClient(
                getMLHost(),
                Integer.parseInt(getMLFinalPort()),
                getMLUsername(),
                getMLPassword(), authMethod);
        return client;
    }

}
