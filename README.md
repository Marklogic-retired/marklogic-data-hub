# Data Hub In a Box

Go from nothing to Enterprise Data Hub in a matter of minutes.


This project allows you to deploy a skeleton Data Hub into MarkLogic. With some basic configuration you will be running an Enterprise Data Hub in no time.

## Installing into MarkLogic
- create a data-hub/gradle-local.properties file and point it to your MarkLogic server _(see data-hub/gradle-local.sample)_
- run ```./gradlew mlDeploy```

## Running Tests
- run ```./gradlew test```

## Using with an IDE
### Eclipse
run ```./gradlew eclipse```
Then import the project into eclipse
