This example demonstrates the simplest way to get started with DHF using Gradle. 

Assuming you have Gradle installed already, first initialize this project folder:

    gradle hubInit

This will generate a gradle-local.properties file with commented-out mlUsername and mlPassword properties. You should 
un-comment these and set them to a MarkLogic user with the "admin" or "manage-admin" and "security" roles (for testing purposes, 
the "admin" user will work).

Then deploy an initial DHF application:

    gradle -i mlDeploy

For a complete list of gradle tasks, check here: [https://marklogic.github.io/marklogic-data-hub/docs/gradle-tasks](https://marklogic.github.io/marklogic-data-hub/docs/gradle-tasks)
