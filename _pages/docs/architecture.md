---
layout: inner
title: Architecture
permalink: /docs/architecture/
---

This page provides information about the implementation of DHF as it runs on MarkLogic

1. [In General](#in-general)
1. [Databases](#databases)
1. [Application Servers](#appservers)
1. [REST Extensions](#rest-extensions)

## In General

As far as maintaining data goes, DHF provides the following services:

* manages the flow and integration of data into and through a MarkLogic system.
* records job and tracing metadata.
* exposes code to operate upon data in the hub.

## Servers and Databases

In installing a data hub, the following databases are created:

* Staging.  The staging database contains data that has been ingested into DHF for further processing.
  * Appserver:   data-hub-STAGING, port 8010.
  * Content db:  data-hub-STAGING
  * Modules db:  data-hub-MODULES
  * Triggers db: data-hub-staging-TRIGGERS
  * Schemas db:  data-hub-staging-SCHEMAS

* Final.  The final appserver is for downstream applications to access harmonized data.  harmonization flows write to the final database.

  * Appserver:   data-hub-FINAL, port 8011.
  * Content db:  data-hub-FINAL
  * Triggers db: data-hub-final-TRIGGERS
  * Modules db:  data-hub-MODULES
  * Schemas db:  data-hub-final-SCHEMAS

* Jobs.  The jobs subsystem stores records of job  (flow runs) activity and traces of what happened during flows runs.  Note that this appserver shares databases with STAGING.
  * Appserver:   data-hub-JOBS, port 8013.
  * Content db:  data-hub-JOBS
  * Triggers db: data-hub-staging-TRIGGERS
  * Modules db:  data-hub-MODULES
  * Schemas db:  data-hub-staging-SCHEMAS

The names of these databases are all configurable using values in `gradle.properties`.

Note: as of 4.0.0 there is no separate TRACING database.  JOBS holds tracing and jobs info.

## REST Extensions

The core of the DHF runs on MarkLogic.  This code is exposed to clients as REST API
extensions, which include both *transforms* and *service extensions*.  These extensions
work identically to other [REST API Extensions](https://docs.marklogic.com/guide/rest-dev/extensions) except that they are provided as out-of-the-box for DHF use.

Here is the list of extensions comprising DHF:

### Transforms:


| Extension name            | Implementing module name |
| --------------------------|--------------------------|
| ml:extractContent         | get-content |
| ml:inputFlow              | run-flow |
| ml:sjsInputFlow           | run-sjs-flow |
| ml:jobSearchResults       | job-search |
| ml:traceSearchResults     | trace-search |
| ml:traceUISearchResults   | trace-json |
| ml:prettifyXML            | prettify |


### Service extensions:


| Extension name            | Implementing module name |
|---------------------------|--------------------------|
| ml:dbConfigs              | db-configs |
| ml:debug                  | debug |
| ml:deleteJobs             | delete-jobs |
| ml:entity                 | entity |
| ml:flow                   | flow |
| ml:sjsFlow                | sjsflow |
| ml:hubstats               | hubstats |
| ml:hubversion             | hubversion |
| ml:piiGenerator           | pii-generator |
| ml:scaffoldContent        | scaffold-content |
| ml:searchOptionsGenerator | search-options-generator |
| ml:tracing                | tracing |
| ml:validate               | validate |
