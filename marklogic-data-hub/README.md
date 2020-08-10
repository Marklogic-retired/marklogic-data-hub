This guide provides help with various development tasks associated with this subproject. It is intended as a companion
to the CONTRIBUTING guide for this project, which covers some of the main tasks associated with developing this project.

## Adding new Data Services

Data Services (DS) are defined in src/main/ml-modules/root/data-hub/5/data-services. You can define a new DS - or 
add endpoints to an existing service - by adding files to this directory.

The easiest way to create a new DS is by running the following Gradle task:

    ../gradlew generateDataService -PserviceName=newOrExistingService -PendpointName=myEndpoint 

You'll need to modify the files that are generated before your DS endpoint actually works. Alternatively, you can just 
copy existing files in the above modules directory and tweak those as needed. 

The build.gradle file in this project will then dynamically define a new Gradle task to generate the Java interface 
for your service. For example, if your new service directory is named "myService", you can run the following task, which 
must be run from the same directory that this README is in: (note that Gradle doesn't care about capitalization, so you
don't need to get that part exactly right):

    ../gradlew generatemyServiceInterface
    
Gradle lets you use task abbreviations, so you can typically just run this:

    ../gradlew generatemyService
 
If you ever want to generate the Java interfaces for all data services, you can run this task:

    ../gradlew generateDataServiceInterfaces
    

