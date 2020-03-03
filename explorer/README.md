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

# How to build with UI

```
./gradlew copyUiFiles -PreactUiPath=/path/to/explorer-ui
```
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
| server.servlet.session.timeout | Sets session timeout in seconds                            | 300                             |
| server.ssl.key-store-type      | Sets the format used for the keystore                      | PKCS12                          |
| server.ssl.key-store           | Sets the path to the keystore containing the certificate   | classpath:keystore/explorer.p12 |
| server.ssl.key-store-password  | Sets the password used to generate the certificate         | explorer                        |
| server.ssl.key-alias           | Sets the alias mapped to the certificate                   | explorer                        |

In order to understand more about configurable properties, check those files (explorer-default.properties,
application.properties, application-production.properties).

Configuration Strategy

Although nearly everything can be done via the command line, there are options that you may want to
consider, whether for security reasons such as concern about unauthorized persons viewing a command
line (such as running "ps -aelf" on the same system that's running Explorer) or to ease the process
of running multiple instances.  You will almost certainly want to take advantage of a mountable
filesystem for logs, for example.  You will definitely want to use your own certificate mapping when
running in a corporate environment, and you will need to ensure that MarkLogic is aware of the
keystore.

One way to go about this in a safe manner and to avoid inadvertently overwriting internal values is
to take advantage of two things:
  spring.config.additional-location="file://path_to_config_file_not_named_application.properties"
  explicitly defining log.path in that file

Such a file may look like this:
```
# the location of the log file
log.path=/mountpoint/sharedlogs/logs

# The format used for the keystore. It could be set to JKS in case it is a JKS file
server.ssl.key-store-type=PKCS12
# The path to the keystore containing the certificate
server.ssl.key-store=classpath:keystore/explorer.p12
# The password used to generate the certificate
server.ssl.key-store-password=explorer
# The alias mapped to the certificate
server.ssl.key-alias=explorer
```

There is one other thing that you may want to do, but it must be set as a system property,
namely define the root logging level.  (It defaults to "INFO" but in a production environment it's
common to run in a less-verbose mode.)  You can also define this in the default include file for
logback (our logging software) that we provide, namely, log_include.xml.

```
<included>

  <!-- override the default value; or comment out to leave it at default -->
  <property name="root.level" value="INFO" />

</included>
```

Naturally, you can set this on the command line you use to start explorer:

```
  $ java -Droot.level=WARN -jar ...
```
as described above.

You can also configure the logging level for MarkLogic Java Client API using  
```
  $ java -Djca.level=WARN -jar ...
```
