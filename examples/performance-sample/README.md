## data-hub performance sample

This example automates the entire setup and scaffolding of a data-hub,
complete with:

- entity creation
- input flow creation
- sample-data retrieval
- data ingestion
- harmonization flow creation
- harmonization

Using the geonames cities5000 (top world cities by population) as our data
source, we create `input-json` and `input-xml` entities, with input flows for
each, and ingest the sample data using MLCP and our input flows, creating JSON
and XML instances of every city. We then create four harmonization flows
representing the cartesian product of data formats (XML, JSON) and code
formats (XQY, SJS), and run each one.

This lets us easily analyze and compare the performance of the default,
scaffolded harmonization flows across data types. This example can also serve
as a reference for data-hub build automation.

### getting started

To get started, copy `build.gradle` into an empty directory and setup a new
data-hub:

```
gradle hubInit
```

In `gradle.properties`, set `mlUsername` and `mlPassword` to your MarkLogic admin account, and check that the other settings are appropriate for your
environment.

You can alternatively set environment-specific properties in
`gradle-$ENV.properties`, and invoke `gradle` with `-PenvironmentName=$ENV`.

### scaffold, ingest, and harmonize

There's an uber-task to handle creating entities and input flows, retrieving
and ingesting data, and creating and running the harmonization flows:

```
gradle doAll
```

Alternately, you can run these steps separately:

```
gradle mlDeploy
gradle createEntityInput
gradle loadInputData
gradle allHarmonizeFlows
```

### profile

There are two profiling mechanisms available in this project. The first is the
built-in gradle profiler:

```
gradle --profile doAll
```

This will write an HTML profile report to 
`./build/reports/profile/profile-$DATETIME.html`.

There's also a custom profiling class that prints per-task execution time to
the terminal:

```
gradle -Pprofile doAll
```

Example output:

```
BUILD SUCCESSFUL in 6m 8s
21 actionable tasks: 21 executed
Task timings:
     2.742s  :hubPreInstallCheck
     0.001s  :mlDeleteModuleTimestampsFile
     0.004s  :mlPrepareRestApiDependencies
    88.791s  :mlDeployApp
     0.000s  :mlPostDeploy
     0.000s  :mlDeploy
     0.004s  :createJsonEntity
     0.002s  :createInputJsonFlow
     0.001s  :createXmlEntity
     0.002s  :createInputXmlFlow
     0.000s  :createEntityInput
     0.005s  :createHarmonizeJsonSjs
     0.003s  :createHarmonizeJsonXqy
     0.002s  :createHarmonizeXmlSjs
     0.002s  :createHarmonizeXmlXqy
     0.000s  :createHarmonizeFlows
     0.418s  :getInputData
     3.595s  :mlLoadModules
    52.553s  :loadJson
    52.685s  :loadXml
     0.003s  :loadInputData
    51.452s  :runHarmonizeJsonSjs
    29.802s  :runHarmonizeJsonXqy
    55.021s  :runHarmonizeXmlSjs
    30.660s  :runHarmonizeXmlXqy
     0.000s  :allHarmonizeFlows
     0.000s  :doAll
```
