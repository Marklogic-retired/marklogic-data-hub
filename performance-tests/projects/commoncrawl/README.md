This example project is a WIP. This project will be used for Performance Testing.

## How to install
To install via Gradle, first initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew hubInit

Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 

Then deploy the application (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i mlDeploy

To verify that the application is installed, visit http://localhost:8011 in your web browser and authenticate as one of
the users defined in the gradle.properties file in this project. If the application was successfully installed, you'll
see a "MarkLogic REST Server" page.

## How to run
Make sure to edit gradle.properties, and set mlHost. You may want to specify a data directory that has enough space (at least 100GB) 

    example: mlForestDataDirectory=/space/data

To load docs into Staging:

    ./gradlew loadWebViaMlcp
    ./gradlew loadIpViaMlcp 

To run mapping step:

    ./gradlew runMapping

To run mastering steps:

    ./gradlew runMastering

