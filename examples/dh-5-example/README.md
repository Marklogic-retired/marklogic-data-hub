This example project demonstrates how to create different flow configurations using DHF 5.

## How to install

To try this project out using QuickStart, start with a clean MarkLogic instance - i.e. without an existing Data hub installation.
Then, you can either install this project's application via QuickStart or via Gradle.

### Install via QuickStart

To install via QuickStart, start QuickStart and browse to this project folder. Use QuickStart to initialize
this project and then deploy the application.

In order for the built-in ingestion steps to work, you must unzip the input.zip file in this project, either manually or via Gradle. 
If you choose to use Gradle, just run the following task:

    ./gradlew extractZip

If you choose to manually unzip the file, verify that after unzipping, an ./input/orders directory exists in the project directory.


### Install via Gradle

To install via Gradle, first initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 

Then deploy the application (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i mlDeploy

Next, start up QuickStart and browse to this project folder and login to QuickStart. 

## How to test the flows
    
With the application deployed, you're ready to run each of the example flows, which are:

1) ingestion_only-flow.flow.json - This flow contains 7 steps. Each step refers to ingesting a different format of input files. The input files are located in the "input" directory.

2) ingestion_mapping-flow.flow.json - This flow contains 4 steps. The input files are located in the "input" directory.
  Step 1 and Step 2 ingest and harmonize (using mapping) json documents.
  Step 3 and Step 4 ingest and harmonize (using mapping) xml documents.

3) ingestion_mapping_mastering-flow.flow.json - This flow contains 3 steps. The input files are located in the "mastering-input" directory.
  Step 1 ingests json documents.
  Step 2 harmonizes json documents.
  Step 3 masters json documents.

Each flow can be run as shown below:

    ./gradlew hubRunFlow -PflowName=ingestion_only-flow
    ./gradlew hubRunFlow -PflowName=ingestion_mapping-flow
    ./gradlew hubRunFlow -PflowName=ingestion_mapping_mastering-flow

In addition, a subset of steps can be run when running a flow:

    ./gradlew hubRunFlow -PflowName=ingestion_only-flow -Psteps=1
    ./gradlew hubRunFlow -PflowName=ingestion_only-flow -Psteps=2,3

## Running flows without depending on a project

As of 5.2.0, this project includes examples of constructing a FlowRunnerImpl that does not depend on project files, nor
on a Spring container, for running flows. See the "runFlowWithoutProject" Gradle task for more information.

To author your own Java code that uses FlowRunnerImpl, you can start with the Gradle configuration below for depending 
on the Data Hub Java API in your own project:

```
plugins {
    id "java"
}

repositories {
    mavenCentral()
}

dependencies {
    compile "com.marklogic:marklogic-data-hub:5.2.0"
}
```
