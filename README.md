# MarkLogic Data Hub Explorer Backend

Entity Models are created by Users in MarkLogic Database. After Data Hub Ingests and Curates, 
harmonized data is loaded into MarkLogic Database for those Entities. 
Explorer is the tool to analyze data stored in those Entities.

# Version Support
For Data Hub Explorer, you need:
  - MarkLogic Server 10.0-2.1 and later
  - Data Hub 5.1.x and later
  - Java JDK 11

# Where is the Backend source
git clone https://project.marklogic.com/repo/scm/prod/datahubenterprise.git

# How to build

```
./gradlew build
```
If you want to skip running test cases use
```
./gradlew build -x test
```

# How to run 

## Run Backend locally from command line

Backend provides some configurable properties. 
For example:
mlHost - What MarkLogic server you are connecting, if not specified, mlHost defined in 
explorer-default.properties will be used as default.
Configure using command line like this: 
```
java -jar ${path-to-war}/marklogic-explorer.war --mlHost=MLServerHost
```

For external configuration file:
Explorer application loads properties from `application.properties` files in the following locations
* A `/config` subdirectory of the current directory
* The current directory

You can also load a custom file (file that's not named `application.properties`) using the 
parameter `spring.config.additional-location` while running the app like this:
```
java -jar ${path-to-war}/marklogic-explorer.war --spring.config.additional-location="file:/path/to/file/gradle.properties"
```

List of all major configurable properties:

| Property                       | Description                                                | Default Value                   |
|--------------------------------|------------------------------------------------------------|---------------------------------|
| mlHost                         | Sets the hostname for the host that runs MarkLogic Server  | localhost                       |
| mlIsHostLoadBalancer           | Indicates if "mlHost" is a load balancer or not            | false                           |
| mlFinalPort                    | Sets port number                                           | 8011                            |
| mlFinalScheme                  | Sets scheme (https/http)                                   | http                            |
| mlFinalAuth                    | Sets authentication mechanism                              | digest                          |
| mlFinalSimpleSsl               | Enables/disables SSL (set it as "true" if scheme is https) | false                           |
| log.path                       | Updates the log path (can be both absolute or relative)    | ./logs                          |
| server.servlet.session.timeout | Sets session timeout                                       | 5 minutes                       |
| spring.profiles.active         | Set it as "production" in a production environment.        | default                         |

Note: Changing spring profile to "production" enables HTTPS with the below mentioned default values.

List of security related properties for Explorer app server:

| Property                       | Description                                                | Default Value                   |
|--------------------------------|------------------------------------------------------------|---------------------------------|
| server.servlet.session.timeout | Sets session timeout                                       | 5 minutes                       |
| server.ssl.key-store-type      | Sets the format used for the keystore                      | PKCS12                          |
| server.ssl.key-store           | Sets the path to the keystore containing the certificate   | classpath:keystore/explorer.p12 |
| server.ssl.key-store-password  | Sets the password used to generate the certificate         | explorer                        |
| server.ssl.key-alias           | Sets the alias mapped to the certificate                   | explorer                        |

In order to understand more about configurable properties, check those files (explorer-default.properties, 
application.properties, application-production.properties).
