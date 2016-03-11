[![Build Status](https://travis-ci.org/marklogic/marklogic-data-hub.svg?branch=master)](https://travis-ci.org/marklogic/marklogic-data-hub)

# MarkLogic Data Hub

Go from nothing to Enterprise Data Hub in a matter of minutes.  


This project allows you to deploy a skeleton Data Hub into MarkLogic. With some basic configuration you will be running an Enterprise Data Hub in no time.

# Quick Start
Want to get up and running quickly? Try the quick-start jar.

- Download the jar from the [releases page](https://github.com/marklogic/marklogic-data-hub/releases/latest).
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

####Available Transforms
Data Hub has provided several transforms that can be used when installed along with the created entities and flows in the MarkLogic server.
####run-flow
This transform can be used to run the flow when inserting document. It accepts the following `entity-name` and `flow-name`. 

#####Use Cases:

1. Using [MarkLogic REST API PUT /v1/documents](http://docs.marklogic.com/REST/PUT/v1/documents)

`curl --anyauth --user <user>:<password> -X PUT -T <documentDirectory> -H "Content-type:<contentType>" 'http://<mlHost>:<port>/<version>/documents?uri=<uri>&transform=run-flow&trans:entity-name=<entityName>&trans:flow-name=<flowName>'`

Example:

`cat ./documents/employee1.xml`

`<employee xmlns="http://company.com/ns/employee">`
`<id>1</id>`
`</employee>`

To insert/update this document with uri '/employee1.xml' into the database 'data-hub-in-a-box-STAGING' (with host 'localhost' and port '8010'), given a user 'admin' with password 'admin' and rest-writer role AND to be able to run the flow 'IngestFlow' of the 'Customer' entity, run the following:

`curl --anyauth --user admin:admin -X PUT -T ./documents/employee1.xml -H "Content-type:application/xml" 'http://localhost:8010/LATEST/documents?uri=/employee1.xml&transform=run-flow&trans:entity-name=Customer&trans:flow-name=IngestFlow'`

This will create a document with uri '/employee1.xml'. The content will depend on the data format of the entity. 

If it is JSON ('application/json'), the content will be:

`{`
`"identifier": "/employee1.xml", `
`"content": "<employee xmlns=\"http://company.com/ns/employee\">\n  <id>1</id>\n</employee>"`
`}`

Else if it is XML ('application/xml'), it will be:

`<?xml  version="1.0" encoding="UTF-8"?>`
`<envelope xmlns="http://marklogic.com/hub-in-a-box/envelope">`
`<headers>`
`</headers>`
`<triples>`
`</triples>`
`<content>`
`<employee xmlns="http://company.com/ns/employee">`
`<id>1</id>`
`</employee>`
`</content>`
`</envelope>`
