This project is similar to the "barebones" example project, but it is instead intended to be testing using a locally published snapshot version of DHF. 

Please see the CONTRIBUTING.md guide in this repository for instructions on how to publish a snapshot version of the DHF Gradle plugin so that it can be used by this project. Once you have published it, you can follow the same instructions in the "barebones" project for initializing this project directory and deploying an application from it. 

Because Hub Central is often tested after installing this project, this project's Gradle file includes a convenience task for creating a user named "hc-developer" with the "hub-central-developer" role and a password of "password":

    ./gradlew createHcDeveloper

After running this task, you can then run Hub Central locally and login as the "hc-developer" user. 
