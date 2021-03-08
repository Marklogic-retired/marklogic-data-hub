This project shows an example of how to package up your DHF project into a zip that can be used 
for deploying your DHF project in an environment with no connection to the Internet. Normally with
a Gradle project, Gradle must be able to access remote repositories on the Internet to find 
dependencies for its plugins. But with this approach, all of the project's Gradle dependencies are 
included in a zip file along with the DHF project files so that the zip contains everything needed 
to deploy your project in a disconnected environment. 

To try out the example in this project, start with a clean MarkLogic instance that does not have 
a DHF project installed in it yet. Then, initialize this DHF project:

    ./gradlew hubInit

This will create the normal set of DHF folders and files in the project directory. 

Now run the following task to create a zip of your project and its Gradle plugin dependencies - note 
that you *must* be connected to the Internet in order for this task to work, as it will need to download any 
Gradle plugin dependencies that are not already in your local Gradle cache:

    ./gradlew buildHubDeployer

This will create the file ./build/hub-deployer.zip (note that you are free to name this file, and the 
Gradle tasks, whatever you would like). 

To try this zip file out, let's first copy it to a temp directory so that we're not performing a 
deployment from our normal root directory:

    mkdir temp
    cp build/hub-deployer.zip temp
    cd temp

Now extract the zip file (the Java jar command works well enough for this):

    jar xvf hub-deployer.zip
    cd hub-deployer

In the extracted hub-deployer directory, you'll see all of the project files along with a 
"gradle-dependencies" directory. This directory is key - it contains all of the jar files that the 
DHF Gradle plugin and Gradle properties plugin depend on. In addition, you'll see that the line 
"disconnected=true" has been added to the project's gradle.properties file. This property controls 
logic in the project's build.gradle file that configures where Gradle should find plugin dependencies. 
With a value of "true", the build.gradle file will look in the "gradle-dependencies" directory. Otherwise, 
it will reach out to remote repositories on the Internet. 

From the hub-deployer directory, you can now deploy your application in the normal fashion. The command 
below assumes that Gradle will be available in the disconnected environment (i.e. it's using "gradle" instead
of the Gradle wrapper via "gradlew"). Also, given that the mlUsername and mlPassword properties aren't 
defined in gradle.properties, they'll need to be defined on the command line:

    ./gradlew -i mlDeploy -PmlUsername=admin -PmlPassword=changeme

The DHF project should now be deployed to MarkLogic. 

Note that the build.gradle file within this project is as a reference and likely a starting point for your 
project. You are free to customize it to e.g. include other directories in your project, or possibly exclude
some files from your project. The concept remains the same though - in order to deploy the application in a 
disconnected environment, the zip file needs to include all of the jar dependencies of the Gradle plugins 
declared in the build.gradle file. 
