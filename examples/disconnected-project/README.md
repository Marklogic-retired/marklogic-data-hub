# Standalone (offline) Gradle deployer for marklogic-data-hub 

## Quickstart 

Summary of the steps required. See sections below for more detailed steps

*NOTE:* The use of gradlew is required

1. Create standalone deployer zip
```
./gradlew makeOfflineZip 
```
2. Copy zip (build/distributions/offline.zip) to desired location / server and unzip

3. Run disconnected tasks from unzip location
```
./gradlew mlDeploy -Pdisconnected=true
```


## Overview 

An example of how to create a completely self-contained deployer zip that contains:

1. All of the plugin / dependencies required to run the deployment (including marklogic-data-hub gradle plugin)
2. The Gradle distribution

Once the zip has been created, you only need Java to run the deployment tasks.

This approach is useful when you need to create a package that does not require any external resources (e.g. Maven/Gradle repositories) to perform deployment operations. 

Note that the gradlew, gradlew.bat and gradle-wrapper.properties files have been modified slightly also

## Requirements

* Java 8/9
* Internet connection (for creation of zip only)


## How it works 

This project will:

* Download all of the required dependencies (including plugins) into the 'build/offline/maven-repo' directory in the project
* Download the Gradle binary distribution (zip) into the 'build/offline/gradle/wrapper' directory in the project
* Create an offline.zip in build/distributions that contains 
    * the Gradle project itself
    * all of the required dependencies 
    * the Gradle distribution that works with the gradlew executable
    

## Usage 

*NOTE:* It is important to use the gradlew executable as it will download the Gradle distribution that will be incorporated into the self-contained deployer zip.

## 1. Create the self-contained deployer zip

*NOTE:* This needs to be executed from a machine with access to the internet. It will create the zip at the location build/distributions/offline.zip 

#### Linux / Mac

```
./gradlew makeOfflineZip 
```

#### Windows

```
gradlew makeOfflineZip 
```


## 2. Unzip the distribution

Copy the created offline.zip to the desired location and unzip

```
unzip offline.zip  
```

## 3. Execute disconnected the Gradle tasks 

From the directory that you have unzipped the offline.zip file into 

```
./gradlew mlDeploy -Pdisconnected=true
```

This will use the jars that you have already downloaded to 'build/offline/maven-repo'

## Customise

**IMPORTANT**: If you want to include dependencies for a configuration (e.g. compile, runtime, mlcp etc), then you need to modify the 'downloadToProjectMavenRepo' task to include the relevant configuration. E.g. by adding 'configurations.compile.files' to the beginning of the task, all of the dependencies for the 'compile' task will be downloaded.

E.g. (assuming you are using the Java plugin), the configuration below will download all the compile and runtime dependencies that you have defined: 

```
task downloadToProjectMavenRepo(type: Copy) {
    configurations.compile.files
    configurations.runtime.files
     ...
```

## Use own gradle instance (rather than gradlew)

If you want to install gradle instead of bundling gradle wrapper (gradlew) with the offline.zip, you can do that too using the following steps

1. Remove build directory (to ensure that no gradlew zip exists in the build dir)

2. Create deployer zip
```
gradle -Dgradle.user.home=build/gradle-home makeOfflineZip 
```
3. Copy zip (build/distributions/offline.zip) to desired location / server and unzip

4. Run  disconnected tasks from unzip location
```
gradle mlDeploy -Pdisconnected=true
```