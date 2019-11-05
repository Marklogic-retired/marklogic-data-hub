# MarkLogic Data Hub Explorer Back-end

Datahub Explorer is a REACT-driven system that provides viewing capabilities for end users. This release is for DHS environments only.
This project is the web service that serves content to explorer-ui.

# Version Support

  - MarkLogic Server 10.0-2.1 and later
  - Data Hub 5.1.x and later

# Getting Started
Explorer is distributed as a group of three Docker containers, one of which contains the UI environment, one of which contains the backed, 
and the third contains MarkLogic and is only packaged as a convenience and is only intended for demo use.

The customer is expected to use a complete MarkLogic installation, as supported by Data Hub Services rather than the containerized version. 
That version is not supported for any purpose other than demonstration.

# Where is the BE source
git clone https://project.marklogic.com/repo/scm/prod/datahubenterprise.git

# How to build

./gradlew build

if you want to skip running test cases,

./gradlew build -x test

# How to run 

## Run BE locally from command line

BE provides some configurable properties. for example,
mlHost - What MarkLogic server you are connecting, if not specified, mlHost defined in explorer-default.properties will be used as default. 
```
java -jar ${path-to-jar}/explorer.jar --mlHost=MLServerHost
```

server.port - the default BE port is 8080, we can change it to 9090.
```
java -jar ${path-to-jar}/explorer.jar --server.port=9090
```

In order to understand more about configurable properties, check those files (explorer-default.properties, 
application.properties, application-production.properties).

## Build and run BE Docker Container

```
Build Docker image
    docker build -t explorer .

Run Docker container via adding command line args:
    docker run -p 8080:8080 explorer --mlHost=host.docker.internal

Run Docker container via setting env. variables:
    docker run -e "mlHost=host.docker.internal" -p 8080:8080 explorer
```
see more details:
https://wiki.marklogic.com/display/ENGINEERING/Run+Explorer+via+Docker#f520f246cb4a42cb9035ba4f62231ada

# Contribute
Explorer is a closed-source project. You can contribute to its success by reporting errors you encounter and 
suggesting improvement or additional features to Product Management.

# Support
The MarkLogic Data Hub is designed, written, and maintained by [MarkLogic][marklogic] Engineering.

Notes: if you want to run BE and FE together using docker-compose, just follow the instruction:
https://wiki.marklogic.com/display/ENGINEERING/Run+Explorer+via+Docker#RunExplorerviaDocker-SetupMLRegistry
