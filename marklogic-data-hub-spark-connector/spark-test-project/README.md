This is a simple project for manual ad hoc testing of the DH Spark connector in a local Spark environment. It is 
intended to be run against the application deployed from ./examples/reference-entity-model in this repository. Please
read the README for that example project in order to deploy it.

**You must use Java 8** when running the Gradle tasks below. The DH Spark connector depends on Spark 2.x, 
which requires Java 8 usage. 

## Building the connector

To use this project, you will first need to build and copy the DH Spark connector to this project by running the following 
Gradle task from the marklogic-data-hub-spark-connector directory (you can abbreviate the task to copycon): 

    ../gradlew copyConnectorToSparkTestProject

This will build and copy the DH Spark connector to the ./lib directory in this project, which is gitignored.

## Running the example Gradle tasks

Each Gradle task described below will connect to a Data Hub instance based on the host, username, and password 
properties defined in this project's gradle.properties file. These properties default to the "hub-operator" user that 
is expected to be deployed by the application in ./examples/reference-entity-model. You may override these via a 
gradle-local.properties file in this project, which is gitignored. They may also be overridden via Gradle "-P" options, 
e.g:

    ./gradlew taskName -Phost=somehost -Pusername=someuser -Ppassword=changeme

The local Gradle wrapper in this project can then be used to run each of the Gradle tasks described below.

The programs run by the Gradle tasks below can also be run via an IDE. If using Intellij, it is recommended to import 
this as a separate Intellij project - i.e. don't import the build.gradle file into your DHF project. Make sure you set 
the project JDK to Java 8, and you should be able to run each program as a regular Java program. Note that you will need
to provide command line arguments for each program via the IDE as well. This approach is often handy for debugging the
program while making modifications to it.


### Writing data

Run the following Gradle task to load the contents of src/main/resources/data/customers.csv into your staging database:

    ./gradlew writeCustomersToStaging

Each row in customers.csv will be written as a separate document. To customize how they are written, you can modify the 
WriteCustomersToStaging Java program.

To see an example of using Spark to perform a "streaming write" - i.e. to open a stream on the CSV file and write from
it to MarkLogic - run the following Gradle task:

    ./gradlew streamingWriteCustomersToStaging

You can examine the StreamingWriteCustomersToStaging program to see the different Spark APIs used to enable streaming
from a data source.


### Reading data 

Assuming that the application deployed by ./examples/reference-entity-model has some Customer entity instances in the 
final database (this will be the case when the application is first deployed), you can read these entity instances as 
rows by running the following Gradle task:

    ./gradlew readCustomersFromFinal

This will read customers from the final database based on the options specified in the ReadCustomersFromFinal 
program in this project. Up to 10 customer rows will be logged. 

