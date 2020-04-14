This is a Spring Boot-based implementation of a middle tier for marklogic-data-hub-central. The intent of this project is to support the following use 
cases:

1. For development, you want to run the UI as you normally would (e.g. npm start), but you want it to talk to a Spring 
Boot middle tier instead of a Node middle tier
1. For production, you want to deploy an executable Spring Boot jar that includes all of the static UI resources


## Using this during development

During development, you'll run two separate processes - the Spring Boot middle tier (which defaults to Tomcat), and 
the UI. Node is still used for building and running the UI. 

To run the UI, first go into the ./marklogic-data-hub-central/ui directory:

    cd marklogic-data-hub-central/ui

The first time you run the UI, and any time after you've made changes or pulled down changes, you'll need to run 
the following task to pull down all of the UI dependencies:

    npm install

Then, you can run the UI:

    npm start

The UI will then be available at http://localhost:3000 . 

You can then run the Spring Boot middle tier by running the following Gradle task from the ./marklogic-data-hub-central directory (i.e. 
the same directory that this README.md file is in):

    ./gradlew bootRun

See the gradle.properties file in this project for the properties that you can customize. If you're testing against a 
local MarkLogic instance, it's likely that your DHF instance uses digest authentication with no SSL. If so, set the 
following property:

    ./gradlew bootRun -PhubUseLocalDefaults=true

If you need that set, odds are you want that as a default. So create gradle-local.properties in this project and add 
the following to it (that file is gitignored):

    hubUseLocalDefaults=true

Alternatively, you can also run the com.marklogic.hub.central.Application class in your IDE. If you need to override 
the properties in gradle.properties that are used for local testing, set them as environment variables when running
this program in your IDE. 

You'll see in the logging that Hub Central is listening on port 8080. This is configured via the server.port property in 
src/main/resources/application.properties . 

If you are instead building the executable war for local testing, read the section below on how to override properties
when doing so.

### Writing tests for the Java middle tier

See the comments in the AbstractOneUiTest class for information on how to write tests for the Java code in this application.

### Viewing OpenAPI docs

To view the OpenAPI docs for the REST middle tier endpoints in this project, just do the following:

    cd marklogic-data-hub-central/ui/mockserver
    npm install
    npm start

## Using this for production 

For a production environment, it's typical to package up a Spring Boot app as an executable war (or jar). Thus, we won't be 
using Node to run the UI - we'll need the UI to be hosted from within the Spring Boot app. 

To build the Spring Boot executable jar, with the UI files included in it, just run:

    gradle clean bootWar

This will produce an executable war in the "build/libs" directory (it also unfortunately involves building the 
apparently-obsolete "trace-ui" in ./marklogic-data-hub, which adds an unnecessary minute to the build time). 

The jar can then be run from the location where it was created:

    java -jar build/libs/marklogic-data-hub-central-(version).war
    
Or copy the jar to any other location to run it. More information on this topic can be found in the 
[Spring Boot docs for installing applications](https://docs.spring.io/spring-boot/docs/current/reference/html/deployment-install.html).

One item of note is that Spring Boot environment properties can be overridden in the following manner when running an 
executable jar or war:

    java -jar build/libs/marklogic-data-hub-central-(version).war --hubUseLocalDefaults=true

## Configuring the application

The Spring Boot application - including connection information to MarkLogic - can be configured in 
src/main/resources/application.properties. The [Spring Boot docs](https://docs.spring.io/spring-boot/docs/current/reference/html/common-application-properties.html) 
contain a full list of all the properties that can be configured.

## More information

- Spring Boot docs are at https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/ 
