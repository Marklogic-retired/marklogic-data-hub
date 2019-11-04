# MarkLogic Data Hub Explorer Back-end

Data-hub Explorer back-end provides web-tier services in order to quickly explore data from MarkLogic Server/Database.

# Version of major components

  - MarkLogic Server 10.0-2 or above
  - Marklogic-client-api 5.0.1 or above
  - Ml-javaclient-util 3.13.3 or above
  - DHF 5.1 or above
  - Java JDK 11 or above
  - Spring boot 2.1.7.RELEASE or above
  - Spring Framework 5.1.5.RELEASE or above
  - Gradle 5.4 or above

# how to build

./gradlew build

if you want to skip running test cases,

./gradlew build -x test

# How to run 

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

## Build and run FE Docker Container
https://project.marklogic.com/repo/projects/PROD/repos/explorer-ui/browse/README.md?at=refs%2Fheads%2Fdevelop

## Run explore BE and FE using docker-compose
https://wiki.marklogic.com/display/ENGINEERING/Run+Explorer+via+Docker#RunExplorerviaDocker-SetupMLRegistry


