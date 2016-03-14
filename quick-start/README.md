# MarkLogic Data Hub - Quick Start

Quick Start is a single-page web application that is deployed in an embedded Tomcat. 

## Configuring the Tomcat server port and web app context path
- edit application.properties file and edit server.port and server.contextPath

## Build and deploy the web app via command line
- run ```gradle build```
- run ```java -jar build/libs/quick-start-0.1.0.war``` (or whatever the current version is in /build/libs/)


## To pass properties to the app, either do the following (in order of priority):
- Add environment.properties in the quick-start directory with the following properties:
userPluginDir=<userPluginDir>
mlRestPort=<host>
mlHost=<port>
mlUsername=<username>
mlPassword=<password>
OR
- Add the command line properties --mlHost=<host> --mlRestPort=<port> --mlUsername=<username> --mlPassword=<password> --userPluginDir=<userPluginDir>


## Build and deploy the web app via Eclipse
- Select Application.java then Run as Java Application
- To develop in eclipse, run ```../gradlew eclipse``` for both quick start and DHIB and make DHIB a project dependency

## Go to the main page
- The main page is accessible at http://localhost:[server.port]/[server.contextPath].
- If server.port is 8080 and server.contextPath is / in application.properties, go to http://localhost:8080/ or http://localhost:8080 and you will see the main page.
