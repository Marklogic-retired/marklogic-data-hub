This is a simple project for manual ad hoc testing of the DH Spark connector in a local Spark environment.

To run this, first run the following Gradle task in the connector project (you can abbreviate it to copycon):

    ../gradlew copyConnectorToSparkTestProject

This will build and copy the DH Spark connector to the ./lib directory in this project, which is gitignored. 

You can run this via the local Gradle wrapper against your local DHF instance (be sure to use Java 8, since Spark 2.x
requires Java 8):

    ./gradlew ingestDatabook
    
The default host/username/password are defined in the gradle.properties file in this directory. You can override these 
via the gitignore'd gradle-local.properties file, or via the command line:

    ./gradlew ingestDatabook -Phost=somewhere -Pusername=someone -Ppassword=something

For further customization of the options sent to the Spark connector, you'll need to modify the WriteTest program itself.

You can also run this via an IDE. If using Intellij, it is recommended to import this as a separate Intellij project - i.e.
don't import the build.gradle file into your DHF project. Make sure you set the project JDK to Java 8, and you should be 
able to run the WriteTest program as a regular Java program. That will typically be helpful for debugging and stepping 
through the code.

