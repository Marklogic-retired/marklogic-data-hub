This example project is intended for use while developing Data Hub itself. 

## How to install

To install via Gradle, first initialize the project:

    ./gradlew hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 

Then deploy the application (the "-i" is for info-level logging, which is helpful to see in case anything goes wrong):

    ./gradlew -i mlDeploy

To verify that the application is installed, visit http://localhost:8011 in your web browser and authenticate as one of
the users defined in the gradle.properties file in this project. If the application was successfully installed, you'll
see a "MarkLogic REST Server" page.

## Deploying resources as a data-hub-developer user 

A user with the data-hub-developer role is permitted to deploy the project to DHS. Update the mlUsername and mlPassword
in gradle-dhs.properties file in this project.

Then deploy the application (the "-i" is for info-level logging, which is helpful to see in case anything goes wrong):

    ./gradlew -i -PenvironmentName=dhs hubDeployAsDeveloper
 

## Authenticating 

This project defines several users in ./src/main/ml-config/security/users that can be used for development and testing. 

