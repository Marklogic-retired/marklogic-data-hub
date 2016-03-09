[![Build Status](https://travis-ci.org/marklogic/marklogic-data-hub.svg?branch=master)](https://travis-ci.org/marklogic/marklogic-data-hub)

# MarkLogic Data Hub

Go from nothing to Enterprise Data Hub in a matter of minutes.  


This project allows you to deploy a skeleton Data Hub into MarkLogic. With some basic configuration you will be running an Enterprise Data Hub in no time.

# Quick Start
Want to get up and running quickly? Try the quick-start jar.

- Download the jar from the [releases page](https://github.com/marklogic/data-hub-in-a-box/releases/latest).
- Run the Jar
  `java -jar quick-start-1.0.0-alpha.1.jar`
- Open the Quickstart Application in your browser:
  http://localhost:8080


# Hacking on the Hub
If you want to start hacking on the internals of the Hub then look here.

#### Clone the Repo
First clone the repo

#### Building the Hub
Note that the Unit tests take a very long time to run. This command skips them
run: `./gradlew build -x test`

#### Running the Hub
run: `./gradlew bootRun`

#### Running Tests
run: `./gradlew test`

#### Using with an IDE
##### Eclipse
To generate eclipse project files run:
`./gradlew eclipse`

Then import the project into eclipse
