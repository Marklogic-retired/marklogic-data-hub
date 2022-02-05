This set of projects demonstrates:
    
    How the "custom-search-modules" project publishes a jar of modules required for entity-view application (modules, data, schemas, or system plugins)
    How an ml-gradle can depend on this artifact so that the files are automatically included in an application

## How to publish the modules as ml-bundle to a repository

The custom-search-modules publishes the entity-viewer-modules.jar to the repository required. It can be confirgured in 
the build.gradle file.

    1) To publish the jar file to maven local, run ./gradlew publishtomavenlocal
    2) To publish the jar file to the repository as configured in the build.gradle, run ./gradlew publish


## How to use the published jar file

The same repository from the above step can be configured in the build.gradle as in the entity-viewer-client example.

Next, deploy the app in the ml-gradle-client-project, replacing "changeme" below with the password for your admin user 
(or using a different admin-like user):
    
    ./gradlew mlDeploy -PmlUsername=admin -PmlPassword=changeme
