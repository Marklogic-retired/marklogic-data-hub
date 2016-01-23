# Data Hub In a Box - Quick Start

Quick Start is a single-page web application that is deployed in an embedded Tomcat. 

## Configuring the Tomcat server port and web app context path
- edit application.properties file and edit server.port and server.contextPath

## Build and deploy the web app via command line
- run ```gradle build```
- run ```java -jar build/libs/quick-start-0.1.0.war```

## Build and deploy the web app via Eclipse
- Select Application.java then Run as Java Application

## Go to the main page
- The main page is accessible at http://localhost:[server.port]/[server.contextPath].
- If server.port is 8080 and server.contextPath is /quick-start in application.properties, go to http://localhost:8080/quick-start and you will see the main page.
