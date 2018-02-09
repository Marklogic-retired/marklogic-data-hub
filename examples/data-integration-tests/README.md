# Data Integration Tests

This folder contains data that is used for developing user stories for data integration.

The data are located in 'input'
```
|-- input  
```

#TLDR; How do I run it?

./gradlew hubInit            

(this creates a gradle.properties file.  edit it.)

./gradlew mlDeploy

./gradlew loadSampleData     (should this be a post-deploy task?)

then run quickstart from the quickstart directory

## What's here

An entity the models an order line.  Some data to map into that model.


