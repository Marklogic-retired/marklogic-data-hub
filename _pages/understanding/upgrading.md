---
layout: inner
title: Upgrading DHF
permalink: /understanding/updating/
---

This page contains the following topics related to upgrading Data Hub Framework and your DHF project.
* [Required Software](#required-software)
* [Supported Upgrade Paths](#supported-upgrade-paths)
* [How to Upgrade Data Hub Framework](#how-to-upgrade-data-hub-framework)
* [Notes for Upgrading to the Latest Version](#notes-for-upgrading-to-the-latest-version)

## Required Software

The software listed in this section is required for using Data Hub Framework for development and for deployment of ingestion and harmonization flows. Production applications that just use harmonized data have no intrinsic dependency on DHF.

Data Hub Framework requires the following software:
* MarkLogic Server; see the support matrix below.
* Oracle Java 8 JRE (client-side)

In addition, the QuickStart tool requires the following software:
* A modern browser, such as Chrome or Firefox (client-side)

The following table lists the minimum version of MarkLogic required by supported versions of the Data Hub Framework.

| DHF Version | Min. MarkLogic Version |
|-------------|------------------------|
| 2.0.4+ | 9.0-5 |
| 3.0.0 | 9.0-5 |
| 4.0.x | 9.0-5* |

Deploying a DHF project or application into a MarkLogic Data Hub Service environment requires DHF 4.0.1 or later and MarkLogic 9.0-7 or later. For details, refer to the Data Hub Service documentation and https://www.marklogic.com/product/marklogic-database-overview/data-hub-service/.

## Supported Upgrade Paths

DHF supports the following upgrade paths:

| From Version | To Version |
|--------------|------------|
| 3.0.0 | 4.x |
| 2.0.4+ | 4.x |

You must be running at least DHF 2.0.4 before upgrading to version 4.0.0 or later. If you are running an earlier version of DHF, first upgrade to the latest 2.0.x version.

If you are upgrading both DHF and MarkLogic, you can upgrade them independently of each other as long as you are running at least the [minimally supported version of MarkLogic](#required-software). If you are running an older version of MarkLogic, then you should upgrade MarkLogic before upgrading DHF.

## How to Upgrade Data Hub Framework
Use the following procedure to upgrade your project to a new version of DHF:

1. Back up your project. For example, ensure your project is under source control and all changes are checked in.
1. Review the [release notes]({{site.baseurl}}/docs/release-notes) and the [upgrade notes](#notes-for-upgrading-to-the-latest-version) on this page.
1. Update the `dependencies` section of `YOUR_PROJECT/build.gradle` to use the latest version of DHF. For example, if your build.gradle file contained the following dependencies and you want to upgrade to DHF 4.0.1, change the DHF version on the `com.marklogic:marklogic-data-hub` line from 3.0.0 to 4.0.1:

       dependencies {
         compile 'com.marklogic:marklogic-data-hub:3.0.0'
         compile 'com.marklogic:marklogic-xcc:9.0.6'
       }
1. Run the `hubUpdate` gradle task in your project directory. For example:

   {% include ostabs.html linux="./gradlew hubUpdate" windows="gradlew.bat hubUpdate" %}

  The `hubUpdate` task might report incompatibilities that you must correct.

1. If you upgrade to DHF 4.0.0 or later, update your gradle properties file to set `mlDHFVersion` to your new DHF version. For example, if you upgrade your "local" environment to DHF 4.0.1, then your `local.properties` file should contain the following: `mlDHFVersion='4.0.1'`.

You should also update the DHF version in the `dependencies` section of any custom build.gradle files that depend on DHF.

## Notes for Upgrading to the Latest Version

Before upgrading your DHF project, you should review the [Changes and Incompatibilities]({{site.baseurl}}/docs/release-notes#changes-and-incompatibilities) section of the release notes and the following additional notes appropriate to your current DHF version:

* [Upgrading a Project with a Custom Hub Name](#upgrading-a-project-with-a-custom-hub-name)
* [Upgrading from 2.0.4+ to 4.0.x](#upgrading-from-204-to-40x) for upgrading from any 2.0.x from 2.0.4 onwards.
* [Upgrading from 3.0.0 to 4.0.x](#upgrading-from-300-to-40x)

## Upgrading a Project with a Custom Hub Name

When you create a project, DHF prefixes the databases and App Servers it configures with "data-hub" by default. For example, DHF creates a database named "data-hub-MODULES" and an App Server named "data-hub-STAGING" by default.

If your project does not use "data-hub" for this prefix, the 4.0.x upgrade process will not properly upgrade your gradle.properties and other configuration files. We recommend you use the following procedure if your project does not use the "data-hub" prefix for database and App Server names:

1. Create a new DHF 4.0.x project. For example, run the `hubInit` gradle task in a new directory.
1. Migrate your customizations and flows to the new project. This includes changing the name of your databases and App Servers in gradle.properties (or gradle-local.properties).
1. Copy the plugins directory from your old project into the new project directory.
1. If you are upgrading from DHF 2.0.x, run the `hubUpdate` gradle task in the new project directory. This step is not necessary when upgrading from DHF 3.0.x.

Note that there a several new gradle properties related to your hub databases and App Servers. You will need to update them to use the desired hub prefix.

For example, where previously your `gradle.properties` or `gradle-local.properties` file contained a setting for `mlTriggersDbName`, now it must contain a setting for `mlStagingTriggersDbName` and `mlFinalTriggersDbName`. This requirement is a side-effect of the following change described in the release notes:

* [Independent **STAGING** and **FINAL** App Server Stacks Stacks]({{site.baseurl}}/docs/release-notes/#independent-staging-and-final-app-server-stacks)  

### Upgrading from 3.0.0 to 4.0.x
The upgrades notes in this section apply specifically to upgrading from DHF 3.0.0 to DHF 4.0.0 and later. You should also review the [release notes]({{site.baseurl}}/docs/release-notes) for more generally applicable information.

* [DHF Core Library Installation Changes](#dhf-core-library-installation-changes)

#### DHF Core Library Installation Changes

The DHF core library modules for DHF 3.0.0 were installed with MarkLogic. Those modules are now obsolete, and upgrading MarkLogic will no longer introduce new versions of the DHF core.

When you upgrade to DHF 4.0.x or install it for the first time, the DHF core library modules are automatically installed on MarkLogic in the modules database shared by your **STAGING** and **FINAL** environments.

This change should be transparent to your application, aside from the module path change described in [New DHF Core Server-Side Module Paths]({{site.baseurl}}/docs/release-notes#new-dhf-core-server-side-module-paths).

### Upgrading from 2.0.4+ to 4.0.x
The upgrades notes in this section apply specifically to upgrading from DHF 2.0.4 or a later 2.0.x release to DHF 4.0.x. You should also review the [release notes]({{site.baseurl}}/docs/release-notes) for more generally applicable information.

If you are upgrading from a DHF version older than 2.0.4, you should first upgrade to the latest 2.0.x version.

* [Support for Server-Side JavaScript Flow Plug-ins](#support-for-server-side-javascript-flow-plug-ins)
* [Writer Plugin Invocation Change](#writer-plugin-invocation-change)
* [Changes to the mlcp Command Line](#changes-to-the-mlcp-command-line)
* [Security Model Changes](#security-model-changes)

#### Support for Server-Side JavaScript Flow Plug-ins
Data Hub Framework now supports Server-Side Javascript flows. Javascript is now the default language for newly created flows, and the DHF core library modules have both XQuery and Server-Side JavaScript implementations. You should use the XQuery core with XQuery plugin code, and the JavaScript core with JavaScript plugin code.

If you upgrade a DHF 2.0.x project then the upgrade modifies any JavaScript plugin code to rely on the DHF core JavaScript library modules.

If your project uses JavaScript plugins or custom code, you should review your code to ensure you only `require` the JavaScript version of any DHF library modules.

For example, if your plugin code contains the following before upgrade:
```
const dhf = require('/com.marklogic/hub/dhf.xqy');
```
Then the same line should read as follows after upgrading DHF:
```
const dhf = require('/data-hub/4/dhf.sjs');
```

#### Writer Plugin Invocation Change

The way in which you invoke the writer plugin from JavaScript has changed. Upgrading should take care of this for you, but if you have customized your main.sjs harmonization plugin or have custom code that invokes the writer directly, you might need to modify the invocation.

For example, the call the `dhf.runWriter` in `main.sjs` previously looked like the following:
```
dhf.runWriter(xdmp.function(null, './writer.sjs'), id, envelope, options);
```
After upgrading, the same code in `main.sjs` should look like the following:
```
const writerPlugin = require('./writer.sjs ');
// ...
dhf.runWriter(writerPlugin, id, envelope, options);
```

#### Changes to the mlcp Command Line

If you have scripts that drive ingestion flows using mlcp rather than  ml-gradle or QuickStart, you must add the following option to your mlcp command line:
```
-modules_root "/"
```
