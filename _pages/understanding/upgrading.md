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
| 2.0.4+ | 9.0-4 |
| 3.0.0 | 9.0-5 |
| 4.0.0 | 9.0-4 |

## Supported Upgrade Paths

You must be running at least DHF 2.0.4 before upgrading to version 4.0.0 or later. If you are running an earlier version of DHF, first upgrade to the latest 2.0.x version.

| From Version | To Version |
|--------------|------------|
| 3.0.0 | 4.x |
| 2.0.4+ | 4.x |

If you are upgrading both DHF and MarkLogic, you should first upgrade DHF. After you get your flows working, upgrade MarkLogic.  

## How to Upgrade Data Hub Framework
You can upgrade Data Hub Framework using the following methods. We recommend using `ml-gradle`.

* [Upgrading Using ml-gradle](#upgrading-using-ml-gradle)
* [Upgrading Using QuickStart](#upgrading-using-quickstart)


### Upgrading Using ml-gradle
Use the following procedure to upgrade your project to a new version of DHF using `ml-gradle`. You should not perform these steps if you have already upgraded using QuickStart.

1. Back up your project. For example, ensure your project is under source control and all changes are checked in.
1. Review the [upgrade notes](#notes-for-upgrading-to-the-latest-version) on this page.
1. Update the `dependencies` section of `YOUR_PROJECT/build.gradle` to use the latest version of DHF. For example, if your build.gradle contains the following dependencies, change the version in the `com.marklogic:marklogic-data-hub` line from 3.0.0 to 4.0.0:

       dependencies {
         compile 'com.marklogic:marklogic-data-hub:3.0.0'
         compile 'com.marklogic:marklogic-xcc:9.0.6'
       }
1. Run the `hubUpdate` gradle task in your project directory. For example:

   {% include ostabs.html linux="./gradlew hubUpdate" windows="gradlew.bat hubUpdate" %}

The `hubUpdate` task might report incompatibilities that you must correct.

If you also plan to upgrade MarkLogic, you should ensure your flows are working before doing so.

### Upgrading Using QuickStart
Use the following procedure to upgrade your project to a new version of DHF using QuickStart. You do not need to perform these steps if you have already upgraded using `ml-gradle`.

1. Back up your project. For example, ensure your project is under source control and all changes are checked in.
Download the latest QuickStart. For details, see [Install the Data Hub Framework](../tutorial/install/).
1. Launch the new QuickStart and navigate to it in your browser. For details, see [Install the Data Hub Framework](../tutorial/install/).
1. Select the project to upgrade and click **NEXT**.
1. Choose the project environment and click **NEXT**.
1. Enter your MarkLogic Server username and password, then click **LOGIN**.

At this point, QuickStart should detect that your project requires an upgrade and present you with the upgrade dialog. Follow the instructions displayed in the dialog.

The upgrade may not be able to change everything in your project impacted by the upgrade. Review the upgrade notes for more details.

If you also plan to upgrade MarkLogic, you should ensure your flows are working before doing so.

To ensure that any project automation you drive with `ml-gradle` uses the same version of DHF, also update the DHF version in the `dependencies` section of any custom build.gradle files. The upgrade automatically updates `YOUR_PROJECT/build.gradle` for you.

## Notes for Upgrading to the Latest Version

This section contains information you should review before upgrading to DHF 4.0.0. The notes are divided into general information and information specific to your current DHF version.

The following notes apply to upgrading from DHF 2.0.4 or later to DHF 4.0.0.

* [**TRACES** database no longer used](#traces-database-no-longer-used)
* [Independent **STAGING** and **FINAL** App Server Stacks Stacks](#independent-staging-and-final-app-server-stacks)
* [New DHF Core Server-Side Module Paths](#new-dhf-core-server-side-module-paths)

You should also review the following notes specific to your current version:

* [Upgrading from 2.0.4+ to 4.0.0](#upgrading-from-204-to-400) for upgrading from any 2.0.x from 2.0.4 onwards.
* [Upgrading from 3.0.0 to 4.0.0](#upgrading-from-300-to-400)

### **TRACES** database no longer used
The **TRACES** database is no longer used by Data Hub Framework. As of version 4.0.0, Data Hub Framework records trace data in the **JOBS** database.

Upgrading does not affect any existing **TRACES** database. However, DHF will not store any future traces in your existing **TRACES** database.

### Independent **STAGING** and **FINAL** App Server Stacks

As of DHF 4.0.0, the **STAGING** and **FINAL** final App Servers each have their own content, modules, schemas, and triggers databases. In previous versions, the **STAGING** and **FINAL** application servers shared the same modules, triggers, and schemas databases.

XXX _what do you need to do about it?_ XXX

### New DHF Core Server-Side Module Paths

Data Hub Framework includes a core set of library modules that get deployed to the **STAGING** modules database. The URIs of these modules have changed, so any code that imports these modules must be updated.

When you upgrade your DHF project using QuickStart or the `hubUpdate` ml-gradle task, the upgrade attempts to fix the module paths for you, but it cannot update custom modules or heavily modified code. You are responsible for updating the DHF module paths in XQuery `import` and JavaScript `require` statements in any such code.

The Data Hub Framework core modules are now installed with a URI prefix of the following form:
```
/data-hub/majorVersion/
```
For example, for DHF 4.0.0, the modules are installed with the URI prefix `/data-hub/4/`.

Older versions of DHF used the following URI prefix:

* DHF 2.0.4: `/com.marklogic.hub/modulename/`
* DHF 3.0.0: `/MarkLogic/data-hub-framework/modulename/`

### Security Model Changes

DHF 4.0.0 includes
### Upgrading from 3.0.0 to 4.0.0
Before upgrading from DHF 3.0.0 to DHF 4.0.0, review the following notes, plus [Upgrading to 4.0.0](#upgrading-to-400).

* [DHF Core Library Installation Changes](#dhf-core-library-installation-changes)

#### DHF Core Library Installation Changes

When you upgrade to DHF 4.0.0 or install it for the first, the DHF core library modules are automatically installed on MarkLogic in the modules database of your **STAGING** App Server.

The DHF core library modules for DHF 3.0.0 were installed with MarkLogic. Those modules are now obsolete, and upgrading MarkLogic will no longer introduce new versions of the DHF core.

This change should be transparent to your application, aside from the module path change described in [New DHF Core Server-Side Module Paths](#new-dhf-core-server-side-module-paths).

### Upgrading from 2.0.4+ to 4.0.0
The upgrades notes in this section apply specifically to upgrading from DHF 2.0.4 or a later 2.0.x release to DHF 4.0.0. You should also review the notes in [Upgrading to DHF 4.0.0](#upgrading-to-dhf-400) for more general guidelines.

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
