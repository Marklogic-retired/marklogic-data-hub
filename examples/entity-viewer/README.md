# Entity Viewer Example Project

You can deploy this project to MarkLogic Server (using ml-gradle) to set up databases, an app server, and a user for running the Entity Viewer Java application. 

This project demonstrates the Entity Viewer application configured with the following data entities: person, organization

1. Start with a clean MarkLogic Server.

2. From the project root, edit the authentication settings in gradle.properties:
```
mlUsername=USERNAME
mlPassword=PASSWORD
```
3. In terminal window #1, from the project root, deploy the project:
```
./gradlew -i mlDeploy
```
Depending on your environment, the deployment may require a restart of MarkLogic.

4. Create and save an entity-viewer.properties file with the following settings, which match what was deployed:
```
# Application user credentials
mlHost=localhost
mlUsername=application-user
mlPassword=password
 
# Content database configuration
mlContentDatabase=entity-viewer-search-content
mlContentModulesDatabase=entity-viewer-search-modules
mlContentServerPort=8099
 
# Address for authentication
loginAddress=http://localhost:8888/api/explore/login
```
5. In terminal window #2, run the application WAR file while referencing the entity-viewer.properties file:
```
java -jar PATH/TO/marklogic-data-hub-central-rc-1.war --requireExampleModules=true --spring.config.location=PATH/TO/entity-viewer.properties
```
6. In terminal window #3, run the userid mock endpoint for application authentication:
```
java -jar /PATH/TO/marklogic-data-hub-central-rc-1.war --server.port=8888
```
7. In terminal window #1, from the project root, load the project modules:
```
./gradlew mlLoadModules
```

8. In a web browser, open the application: http://localhost:8080
