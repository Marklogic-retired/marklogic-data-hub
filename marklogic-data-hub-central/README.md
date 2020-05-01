This is a Spring Boot-based implementation of a middle tier for marklogic-data-hub-central. The intent of this project is to support the following use 
cases:

1. For development, you want to run the UI as you normally would (e.g. npm start), but you want it to talk to a Spring 
Boot middle tier instead of a Node middle tier
1. For production, you want to deploy an executable Spring Boot jar that includes all of the static UI resources


# Developing Data Hub Central

During development, you'll run two separate processes - the Spring Boot middle tier (which defaults to Tomcat), and 
the UI. Node is still used for building and running the UI. In addition, you'll also need to have a Data Hub instance 
that you can talk to. Running each of these processes is described below. 

## Running a Data Hub instance

If you're developing locally and not connecting to a Data Hub instance elsewhere - such as hosted by DHS - you'll need 
to have a Data Hub instance running locally that you can connect to. You'll typically want to build this instance off 
the branch that you're working on so that it has the latest changes from the develop branch. 

### Publishing the Data Hub Gradle plugin 

First, run the command below from the root directory in this repository to publish the Data Hub Gradle plugin to your local 
Maven repository (defaults to ~/.m2/repository, but you won't need to access that directly):

    ./gradlew publishToMavenLocal -PskipWeb=

"./gradlew" is a script that uses the [Gradle wrapper](https://docs.gradle.org/current/userguide/gradle_wrapper.html) to 
download a copy of Gradle for you. This ensures that all developers use the same version of Gradle. Also, the "skipWeb" 
property is included to avoid building the QuickStart application in the "./web" directory, which can require a couple minutes to complete.

With that plugin published, you can now use it in any local Data Hub project that you'd like to work with. 
 
Also, when you update the branch that you're working on - e.g. rebasing off develop, or starting a new branch off develop - 
it's very likely that you'll pull in changes to the ./marklogic-data-hub and/or ./ml-data-hub-plugin subprojects. After 
doing so, you should run the command above to ensure that you're working with the latest changes to Data Hub.

### Using the Data Hub Gradle plugin in a project

For convenience, you can use the ./examples/reference-entity-model project in this repository. It is setup to allow you to
quickly deploy a DH application using the plugin you just published. To do so, just read the README in that project. 

After you've deployed the application, it's likely that you'll update your branch later on - perhaps rebasing it from 
the develop branch - and you'll need to update your application. To do so, you'll first need to publish the Gradle 
plugin again, as described above. Then, because there's a chance that new resources - such as roles and privileges - 
may have been added to the DH Gradle plugin, you should initialize the project again to ensure that these resources
are added to the project. This will avoid any deployment errors from occurring, where those errors result from the
new resources not existing yet. To do so, just run the following from the ./examples/reference-entity-model project:

    ./gradlew -i hubInit mlDeploy 

Note that the "-i" is optional - it's for info-level logging, and while you don't need it, it's often very helpful 
in case an error occurs. 

## Running the middle tier

You can run the Spring Boot middle tier by running the following Gradle task from the ./marklogic-data-hub-central directory (i.e. 
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

If you are connecting to a remote Data Hub instance, you can override mlHost to connect to it:

    ./gradlew bootRun -PmlHost=somehost

Once you have Hub Central running, you'll see the logging indicating that it is listening on port 8080. This is 
configured via the server.port property in src/main/resources/application.properties . 

If you are instead building the executable war for local testing, read the section below on how to override properties
when doing so.

### Viewing the API docs

Once you have the middle tier running, you can visit http://localhost:8080/swagger-ui.html to view the API docs for 
all of the endpoints exposed by the middle tier. See the Application.java class in the middle tier for information on 
how this is configured.


## Running the user interface

To run the UI, first go into UI project directory:

    cd marklogic-data-hub-central/ui

The first time you run the UI, and any time after you've made changes or pulled down changes, you'll need to run 
the following task to pull down all of the UI dependencies:

    npm install

Then, you can run the UI:

    npm start

The UI will then be available at http://localhost:3000 . 

## Writing tests for the Java middle tier

See the comments in the AbstractOneUiTest class for information on how to write tests for the Java code in this application.

# Running Data Hub Central in production 

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

# More information

The Spring Boot application - including connection information to MarkLogic - can be configured in 
src/main/resources/application.properties. The [Spring Boot docs](https://docs.spring.io/spring-boot/docs/current/reference/html/common-application-properties.html) 
contain a full list of all the properties that can be configured.

- Spring Boot docs are at https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/ 
