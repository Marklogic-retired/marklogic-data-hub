h2. Building and testing the connector jar 

To build the connector, run:

    ../gradlew shadowJar
    
This produces an "uber" jar at build/libs/marklogic-data-hub-spark-connector-(version)-all.jar . This jar can then be 
included in a Spark environment. 

An example of such an environment is in the ./spark-test-project directory. Please see the README file in that directory
for instructions on how to test the connector jar within that project. 

h2. Running the connector tests 

To run the automated tests for this project, run:

    ../gradlew test

Note that if you would like to run the tests in an IDE like Intellij, you must first run the Gradle task 
"copyConnectorModulesFromCoreProject" so that the connector modules, which live in the ./marklogic-data-hub project, 
are available to be loaded by the tests. Running "test" will do this for you automatically. 



