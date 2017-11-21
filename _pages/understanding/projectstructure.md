---
layout: inner
title: Project Structure
lead_text: ''
permalink: /understanding/project-structure/
---

This page describes the Directory Structure for a Data Hub Framework Project.

```
|- your-data-hub-dir
   |- build.gradle
   |- gradle
      |- wrapper
         |- gradle-wrapper.jar
         |- gradle-wrapper.properties
   |- gradle.properties
   |- gradle-local.properties
   |- gradlew
   |- gradlew.bat
   |- hub-internal-config
   |- plugins
      |- entities
         |- employee
            |- input
               |- inputflow 1
                  |- content.(sjs|xqy)
                  |- headers.(sjs|xqy)
                  |- main.(sjs|xqy)
                  |- triples.(sjs|xqy)
               |- inputflow 2
               |- ...
               |- inputflow N
               |- REST
            |- harmonize
               |- harmonizeflow 1
                  |- collector.(sjs|xqy)
                  |- content.(sjs|xqy)
                  |- headers.(sjs|xqy)
                  |- main.(sjs|xqy)
                  |- triples.(sjs|xqy)
                  |- writer.(sjs|xqy)
               |- ...
               |- harmonizeflow N
               |- REST
   |- user-config
   |- .tmp
```
# build.gradle
This file allows you to use [Gradle](https://gradle.org/) to configure and manager your Data Hub instance. Visit the [Gradle website](https://gradle.org/) for full documentation on how to configure it.

# gradle
This directory houses the gradle wrapper. When you provision a new Data Hub Framework project you get the gradle wrapper. Gradle Wrapper is a specific, local version of gradle. You can use the wrapper to avoid having to install gradle on your system.

# gradle.properties
This properties file defines variables needed by the hub to install and run properly. Ideally you would store values here that apply to all instances of your Data Hub

# gradle-local.properties
This properties file overrides the variables in gradle.properties for your local environment. If you need to change a value to run locally this is where you would do it.

# gradle-{env}.properties
The Data Hub Framework looks for various environments based on which override files you have in your hub project. You can have as many environments as you like. Simply create a new override file with the environment name after the dash.

ex: gradle-dev.properties, gradle-qa.properties, gradle-prod.properties

# gradlew, gradlew.bat
These are the *nix and Windows executable files to run the gradle wrapper. Gradle Wrapper is a specific, local version of gradle. You can use the wrapper to avoid having to install gradle on your system.

# hub-internal-config folder
This folder contains sub-folders and json files used to configure your MarkLogic server. These files represent the minimum configuration necessary for the Data Hub Framework to function. Do not edit anything in this directory. Instead, go edit inside of the [user-config folder](#user-config-folder).

```
|- marklogic-config
   |- databases
      |- final-database.json
      |- job-database.json
      |- modules-database.json
      |- schemas-database.json
      |- staging-database.json
      |- trace-database.json
      |- triggers-database.json
   |- mimetypes
      |- woff.json
      |- woff2.json
   |- security
      |- roles
         |- data-hub-role.json
      |- users
         |- data-hub-user.json
   |- servers
      |- final-server.json
      |- job-server.json
      |- staging-server.json
      |- trace-server.json
```

Each of the above json files conforms to the MarkLogic REST API for creating [databases](https://docs.marklogic.com/REST/PUT/manage/v2/databases/[id-or-name]/properties) or [servers](https://docs.marklogic.com/REST/PUT/manage/v2/servers/[id-or-name]/properties) 

# plugins folder
This folder contains your server side modules that get deployed into MarkLogic. You can put any server side files in here that you like. When deployed to MarkLogic ./plugins is equivalent to the root uri **/**.

The only caveat is that the **entities** folder is reserved for Hub use and is treated as a special case by the deploy process.

## plugins/entities
This folder contains your entity definitions. An Entity is a domain object like Employee or SalesOrder. This folder contains two sub-folders: **input** and **harmonize**. The Data Hub Framework has custom logic to handle the deploy of this folder to MarkLogic. 

### plugins/entities/input
The input sub-folder contains all of the input flows for a given entity. Input flows are responsible for creating an XML or JSON envelope during content ingest. This folder contains one server side modules for each part of the envelope: content, headers, and triples. You may also optionally include a REST folder which contains custom MarkLogic REST extensions that are related to this input flow.

#### plugins/entities/input/content.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for creating the content section of your envelope.

#### plugins/entities/input/headers.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for creating the headers section of your envelope.

#### plugins/entities/input/main.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for orchestrating your plugins.

#### plugins/entities/input/triples.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for creating the triples section of your envelope.

#### plugins/entities/input/REST
This optional sub-folder contains server side modules (XQuery or Javascript) and option definitions (XML or JSON) for MarkLogic's REST API.

A typical REST folder can look like this.

```
|- REST
   |- options
   |- transforms
   |- services
```

#### plugins/entities/input/REST/options
This folder contains REST search option definitions (XML or JSON). See the [MarkLogic Query Options Docs](https://docs.marklogic.com/REST/GET/v1/config/query/%5B'default'-or-name%5D) for details. Once deployed, these options are available on the STAGIN server.

#### plugins/entities/input/REST/transforms
This folder contains REST transform modules (XQuery or Javascript). See the [MarkLogic REST API Docs](https://docs.marklogic.com/guide/rest-dev/transforms) for details.

#### plugins/entities/input/REST/services
This folder contains REST extension modules (XQuery or Javascript). See the [MarkLogic REST API Docs](https://docs.marklogic.com/guide/rest-dev/extensions) for details. Once deployed, these options are available on the STAGING server.

### plugins/entities/harmonize
The harmonizer sub-folder contains all of the harmonize flows for a given entity. Harmonize flows are responsible for creating an XML or JSON envelope during content harmonization. This folder contains one server side module for each part of the envelope: content, headers, and triples. It also contains **collector** and **writer** modules as described below. You may also optionally include a REST folder which contains custom MarkLogic REST extensions that are related to this input flow.

#### plugins/entities/harmonize/collector.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for returning a list of things to harmonize. Harmonization is a batch process that operates on one or more items. The returned items should be an array of strings. Each string can have any meaning you like: uri, identifier, sequence number, etc.

#### plugins/entities/harmonize/content.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for creating the content section of your envelope.

#### plugins/entities/harmonize/headers.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for creating the headers section of your envelope.

#### plugins/entities/input/main.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for orchestrating your plugins.

#### plugins/entities/harmonize/triples.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for creating the triples section of your envelope.

#### plugins/entities/harmonize/writer.(sjs|xqy)
The server side module (XQuery or Javascript) responsible for persisting your envelope into MarkLogic.

#### plugins/entities/harmonize/REST
This optional sub-folder contains server side modules (XQuery or Javascript) and option definitions (XML or JSON) for MarkLogic's REST API.

A typical REST folder can look like this.

```
|- REST
   |- options
   |- transforms
   |- services
```

#### plugins/entities/harmonize/REST/options
This folder contains REST search option definitions (XML or JSON). See the [MarkLogic Query Options Docs](https://docs.marklogic.com/REST/GET/v1/config/query/%5B'default'-or-name%5D) for details. Once deployed, these options are available on the FINAL server.

#### plugins/entities/harmonize/REST/transforms
This folder contains REST transform modules (XQuery or Javascript). See the [MarkLogic REST API Docs](https://docs.marklogic.com/guide/rest-dev/transforms) for details.

#### plugins/entities/harmonize/REST/services
This folder contains REST extension modules (XQuery or Javascript). See the [MarkLogic REST API Docs](https://docs.marklogic.com/guide/rest-dev/extensions) for details. Once deployed, these options are available on the FINAL server.

# user-config folder
This folder contains sub-folders and json files used to configure your MarkLogic server.
See [ml-gradle wiki](https://github.com/marklogic-community/ml-gradle/wiki) for details on what goes in here.
Any json files you put here will be merged with the hub-internal-config configurations by the Data Hub Framework upon deploy.

# .tmp folder
This folder contains temporary Hub artifacts. You may safely ignore it.
