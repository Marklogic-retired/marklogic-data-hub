---
layout: inner
title: Project Directory Structure
permalink: /refs/project-structure/
redirect_from: "/understanding/project-structure/"
---

# Project Directory Structure

When you initialize a Data Hub Framework project using QuickStart or the `hubInit` gradle task, it sets up the following directory hierarchy. The diagram includes some placeholder entries so you can see, for example, how creation of entities, flows, and mappings interacts with the layout. An explanation of the sub-directories and files follows the diagram.

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
   |- plugins
      |- entities
         |- Employee
            |- input
               |- inputflow 1
                  |- content.(sjs|xqy)
                  |- headers.(sjs|xqy)
                  |- main.(sjs|xqy)
                  |- triples.(sjs|xqy)
               |- inputflow 2
               |- ...
               |- inputflow N
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
      |- mappings
        |- mappingName 1
          |- mappingName-0.mapping.json
          |- ...
          |- mappingName-N.mapping.json
   |- src
      |- main
         |- hub-internal-config
         |- ml-config
         |- ml-modules
   |- .tmp
```

## Root

### build.gradle
This file enables you to use [Gradle](https://gradle.org/) to configure and manage your data hub instance. Visit the [Gradle website](https://gradle.org/) for full documentation on how to configure it.

### gradle
This directory houses the gradle wrapper. When you provision a new DHF project you get the gradle wrapper. Gradle wrapper is a specific, local version of gradle. You can use the wrapper to avoid having to install gradle on your system.

### gradle.properties
This properties file defines variables needed by the hub to install and run properly. Ideally you would store values here that apply to all instances of your data hub.

### gradle-local.properties
This properties file overrides the variables in gradle.properties for your local environment. If you need to change a value to run locally this is where you would do it.

### gradle-{env}.properties
DHF looks for various environments based on which override files you have in your hub project. You can have as many environments as you like. Simply create a new override file with the environment name after the dash.

For example: gradle-dev.properties, gradle-qa.properties, gradle-prod.properties

### gradlew, gradlew.bat
These are the \*nix and Windows executable files to run the gradle wrapper. Gradle wrapper is a specific, local version of gradle. You can use the wrapper to avoid having to install gradle on your system.

## plugins folder
This folder contains project-specific server-side modules that get deployed into MarkLogic. You can put any server-side files in here that you like, but the recommended location for custom modules and transforms is src/main/ml-modules; see the [ml-gradle documentation](https://github.com/marklogic-community/ml-gradle/wiki/How-modules-are-loaded) for details.

When deployed to MarkLogic ./plugins is equivalent to the root uri **/**, so a library module at `./plugins/my-folder/my-lib.xqy` would be loaded into the modules database as `/my-folder/my-lib.xqy`.

The only caveat is that the **entities** folder is reserved for Hub use and is treated as a special case by the deploy process.

### plugins/entities
This folder contains your entity definitions. An entity is a domain object like Employee or SalesOrder. Each entity folder contains two subfolders: **input** and **harmonize**. DHF has custom logic to handle the deployment of this folder to MarkLogic.

### plugins/entities/{entity}/input
The input subfolder contains all of the input flows for a given entity. Input flows are responsible for creating an XML or JSON envelope during content ingest. This folder contains one server-side module for each part of the envelope: content, headers, and triples. You may also optionally include a REST folder that contains custom MarkLogic REST extensions related to this input flow.

### plugins/entities/{entity}/input/content.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for creating the content section of your envelope.

### plugins/entities/{entity}/input/headers.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for creating the headers section of your envelope.

### plugins/entities/{entity}/input/main.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for orchestrating your plugins.

### plugins/entities/{entity}/input/triples.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for creating the triples section of your envelope.

### plugins/entities/{entity}/harmonize
The harmonize subfolder contains all of the harmonize flows for a given entity. Harmonize flows are responsible for creating an XML or JSON envelope during content harmonization. This folder contains one server-side module for each part of the envelope: content, headers, and triples. It also contains **collector** and **writer** modules as described below. You may also optionally include a REST folder that contains custom MarkLogic REST extensions that are related to this input flow.

### plugins/entities/{entity}/harmonize/collector.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for returning a list of things to harmonize. Harmonization is a batch process that operates on one or more items. The returned items should be an array of strings. Each string can have any meaning you like: uri, identifier, sequence number, etc.

### plugins/entities/{entity}/harmonize/content.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for creating the content section of your envelope.

### plugins/entities/{entity}/harmonize/headers.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for creating the headers section of your envelope.

### plugins/entities/{entity}/input/main.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for orchestrating your plugins.

### plugins/entities/{entity}/harmonize/triples.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for creating the triples section of your envelope.

### plugins/entities/{entity}/harmonize/writer.(sjs|xqy)
The server-side module (XQuery or JavaScript) responsible for persisting your envelope into MarkLogic.

### plugins/entities/{entity}/harmonize/REST
In DHF 4.0, items that used to be here should be placed in `src/main/ml-modules`

### plugins/mappings
This folder contains model-to-model mapping configuration artifacts that can be used to configure an input flow. For details, see [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/).

### plugins/mappings/{mapping}
This folder contains all versions of a given model-to-model mapping. The name of the folder is the same as mapping name. For details, see For details, see [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/).

### plugins/mappings/{mapping}/{mapping}-{version}.json
A model to model mapping configuration files. There may be multiple versions. For example, QuickStart creates a new version each time you modify a mapping. For details, see For details, see [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/).


## src/main/hub-internal-config folder
{% include note.html type="NOTE" content="As of DHF 4.0.0, the internal structure of all configuration directories aligns with that of `ml-gradle` and should work as documented in that project." %}

This folder contains subfolders and JSON files used to configure your MarkLogic server. These files represent the minimum configuration necessary for DHF to function. Do not edit anything in this directory. Instead, make a file with the same name and directory structure under the [ml-config folder](#ml-config) and add any properties you'd like to override.

```
|- databases
  |- staging-database.json
  |- job-database.json
  |- modules-database.json
  |- staging-schemas-database.json
  |- staging-triggers-database.json
|- security
  |- roles
     |- data-hub-role.json
     |- hub-admin-role.json
  |- users
     |- data-hub-user.json
     |- hub-admin-user.json
|- servers
  |- job-server.json
  |- staging-server.json
```

Each of the above JSON files conforms to the MarkLogic REST API for creating [databases](https://docs.marklogic.com/REST/PUT/manage/v2/databases/[id-or-name]/properties), [mimetypes](https://docs.marklogic.com/REST/PUT/manage/v2/mimetypes/[id-or-name]/properties), [roles](https://docs.marklogic.com/REST/PUT/manage/v2/roles/[id-or-name]/properties), [users](https://docs.marklogic.com/REST/PUT/manage/v2/users/[id-or-name]/properties), or [servers](https://docs.marklogic.com/REST/PUT/manage/v2/servers/[id-or-name]/properties).

### src/main/ml-config folder
This folder contains subfolders and JSON files used to configure your MarkLogic server.
It contains some configuration that is used to bootstrap a DHF's **FINAL** environment.  In addition, users can place more configuration artifacts here to customize the system
See [ml-gradle wiki](https://github.com/marklogic-community/ml-gradle/wiki) for details on what goes in here.
Any JSON files you put here will be merged with the hub-internal-config configurations by the Data Hub Framework upon deploy.

### src/main/ml-modules
This folder is the standard `ml-gradle` location for artifacts to be deployed to the modules database.  It comes out-of-the box with a default Search options configuration.

### src/main/ml-modules-jobs
This folder is the standard `ml-gradle` location for artifacts to be deployed to the modules database, but to be used with the JOBS appserver (specifically, the jobs and traces search options configuration.  Users probably have no need to add to this directory.


## .tmp folder
This folder contains temporary hub artifacts. You may safely ignore it.


## See Also
- [Plugins]({{site.baseurl}}/understanding/plugins/)
