This guide provides help with various development tasks associated with this subproject. It is intended as a companion
to the CONTRIBUTING guide for this project, which covers some of the main tasks associated with developing this project.

## Adding new Data Services interfaces

DS interfaces are defined in src/main/ml-modules/root/data-hub/5/data-services. You can define a new DS interface - or 
add endpoints to an existing interface - by adding files to this directory. The common approach is to just copy files
from an existing directory, copy those into a new directory, and then modify the files.

The build.gradle file in this project will then dynamically define a new Gradle task to generate the Java interface 
for your service. For example, if your new service directory is named "myService", you can run the following task, which 
must be run from the same directory that this README is in: (note that Gradle doesn't care about capitalization, so you
don't need to get that part exactly right):

    ../gradlew generatemyServiceInterface
 
If you ever want to generate the Java interfaces for all data services, you can run this task:

    ../gradlew generateDataServiceInterfaces
    

