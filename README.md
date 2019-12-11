# MarkLogic Data Hub Explorer Back-end

Data Hub Explorer is a REACT-driven system that provides viewing capabilities for end users.
This project is the web service that serves content to explorer-ui.

# Version Support
For Data Hub Explorer, you need:
  - MarkLogic Server 10.0-2.1 and later
  - Data Hub 5.1.x and later
  - Java JDK 11 or later

# Where is the BE source
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

## Run BE locally from command line

BE provides some configurable properties. for example,
mlHost - What MarkLogic server you are connecting, if not specified, mlHost defined in explorer-default.properties will be used as default. 
```
java -jar ${path-to-jar}/explorer.jar --mlHost=MLServerHost
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
| spring.profiles.active         | Set it as "production" if scheme is https                  | default                         |
| log.path                       | Updates the log path                                       | ./logs                          |
| server.servlet.session.timeout | Sets session timeout                                       | 5 minutes                       |
| server.ssl.key-store-type      | Sets the format used for the keystore                      | PKCS12                          |
| server.ssl.key-store           | Sets the path to the keystore containing the certificate   | classpath:keystore/explorer.p12 |
| server.ssl.key-store-password  | Sets the password used to generate the certificate         | explorer                        |
| server.ssl.key-alias           | Sets the alias mapped to the certificate                   | explorer                        |

In order to understand more about configurable properties, check those files (explorer-default.properties, 
application.properties, application-production.properties).

# Contribute
Explorer is a closed-source project. You can contribute to its success by reporting errors you encounter and 
suggesting improvement or additional features to Product Management.

# Support
The MarkLogic Data Hub is designed, written, and maintained by [MarkLogic][marklogic] Engineering.

Notes: if you want to run BE and FE together using docker-compose, just follow the instruction:
https://wiki.marklogic.com/display/ENGINEERING/Run+Explorer+via+Docker#RunExplorerviaDocker-SetupMLRegistry
