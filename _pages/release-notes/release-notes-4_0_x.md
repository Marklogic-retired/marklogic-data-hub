---
layout: inner
title: DHF 4.0.x Release Notes
permalink: /release-notes/release-notes-4_0_x/
---

# DHF 4.0.x Release Notes

* [New Features in DHF 4.0.0](#new-features-in-dhf-4.0.0)
* [Changes and Incompatibilities](#changes-and-incompatibilities)


## New Features in DHF 4.0.0

* [Declarative Mapping of Harmonization Flows](#declarative-mapping-of-harmonization-flows)
* [Support for Securing Personally Identifiable Information](#support-for-securing-personally-identifiable-information)

### Declarative Mapping of Harmonization Flows

You can now generate harmonization flows from a declarative source-to-entity-model mapping called a _model-to-model mapping_. Use a model-to-model mapping to quickly and easily define how to harmonize source data to produce entity instances, without writing any code.

DHF 4.0.0 also includes a new Mapping interface in QuickStart for defining model-to-model mappings.

For details, see [Create a Model-to-Model Mapping for Product]({{site.baseurl}}/tutorial/3x/mapping-product-entity/) in the DHF tutorial, and [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping).

### Support for Securing Personally Identifiable Information

As of DHF 4.0.0, you can easily restrict access to Personally Identifiable Information (PII) in your harmonized instances by flagging PII properties in your entity model. DHF then generates MarkLogic Element Level Security configuration artifacts for controlling access to these properties.

This feature requires MarkLogic 9.0-6 or later.

For details, see [Managing Personally Identifiable Information (PII)]({{site.baseurl}}/govern/pii).


## Changes and Incompatibilities

See the following topics for details on changes and incompatibilities in DHF:

* [DHF 4.0.0 Changes and Incompatibilities](#dhf-400-changes-and-incompatibilities)
* [DHF 4.0.1 Changes and Incompatibilities](#dhf-401-changes-and-incompatibilities)

### DHF 4.0.0 Changes and Incompatibilities

Data Hub Framework 4.0.0 includes the following changes, some of which may introduce incompatibilities.

* [Security Model Improvements](#security-model-improvements)
* [ml-gradle Compatible Project Structure](#ml-gradle-compatible-project-structure)
* [New DHF Core Server-Side Module Paths](#new-dhf-core-server-side-module-paths)
* [**TRACES** database no longer used](#traces-database-no-longer-used)
* [Independent **STAGING** and **FINAL** App Server Stacks](#independent-staging-and-final-app-server-stacks)

#### Security Model Improvements
DHF 4.0.0 supports better separation of roles and responsibilities between development, deployment, and ingestion tasks. For more details, see the new security model documentation: [Security]({{site.baseurl}}/refs/security/).

You do not have to make changes to your DHF project or data application in response to this change, but you may be able to improve the security of your project by taking advantage of the new configurable roles.

#### ml-gradle Compatible Project Structure

Projects created (or upgraded) using DHF 4.0.0 have a structure that is compatible with the `ml-gradle` default project structure. This change eliminates or relocates the following project directories:

* YOUR_PROJECT/plugins/entities/YOUR_ENTITY/input/REST/
* YOUR_PROJECT/plugins/entities/YOUR_ENTITY/harmonize/REST/
* YOUR_PROJECT/user-config/
* YOUR_PROJECT/entity-config/

The content that was previously stored in these directories now belongs under  YOUR_PROJECT/src/main/, in accordance with the standard `ml-gradle` [project structure](https://github.com/marklogic-community/ml-gradle/wiki/Project-layout).

When you upgrade an existing project to DHF 4.0.0, some project directories will be renamed with a ".old" suffix. You should migrate any customizations not addressed by the DHF upgrade process into YOUR_PROJECT/src/main/.

As a general guideline:
* Files that used to go in YOUR_PROJECT/user-config/ now belong in YOUR_PROJECT/src/main/ml-config.
* Files that used to go in YOUR_PROJECT/entity-config/ now belong in YOUR_PROJECT/src/main/entity-config.
* Customizations you may have made under YOUR_PROJECT/hub-internal-config are better kept in YOUR_PROJECT/src/main/ml-config.

For more details, see [Project Structure]({{site.baseurl}}/understanding/project-structure). To learn more about `ml-gradle`, see the [ml-gradle wiki](https://github.com/marklogic-community/ml-gradle/wiki) on GitHub.

#### New DHF Core Server-Side Module Paths

Data Hub Framework includes a core set of library modules that get deployed to a modules database. The URIs of these modules have changed, so any code that imports these modules must be updated.

The Data Hub Framework core modules are now installed with a URI prefix of the following form:
```
/data-hub/majorVersion/
```
For example, for DHF 4.0.0, the modules are installed with the URI prefix `/data-hub/4/`.

Older versions of DHF used the following URI prefix:

* DHF 2.0.4: `/com.marklogic.hub/modulename/`
* DHF 3.0.0: `/MarkLogic/data-hub-framework/modulename/`

When you upgrade your DHF project using the `hubUpdate` ml-gradle task, the upgrade attempts to fix the module paths for you, but it cannot update custom modules or heavily modified code. You are responsible for updating the DHF module paths in XQuery `import` and JavaScript `require` statements in any such code.

#### **TRACES** Database No Longer Used
The **TRACES** database is no longer used by Data Hub Framework. As of version 4.0.0, Data Hub Framework records trace data in the **JOBS** database.

Upgrading does not affect any existing **TRACES** database. However, DHF will not store any future traces in your existing **TRACES** database.

#### Independent **STAGING** and **FINAL** App Server Stacks

As of DHF 4.0.0, the **STAGING** and **FINAL** final App Servers each have their own content, schemas, and triggers databases. In previous versions, the **STAGING** and **FINAL** application servers shared the same modules, triggers, and schemas databases. This change introduces several new gradle properties.

You do not need to make changes to your project to accommodate this change unless your hub databases and App Servers use a prefix other than "data-hub". For example, if your **STAGING** database is not named "data-hub-STAGING", then see [Upgrading a Project with a Custom Hub Name]({{site.baseurl}}/upgrade/upgrade-to-4_0_x/#upgrading-a-project-with-a-custom-hub-name).

**NOTE**: DHF 4.0.0 projects have separate modules databases for **STAGING** and **FINAL**. As of DHF 4.0.1, **STAGING** and **FINAL** share a single modules database. For details, see [Shared Modules Database for Staging and Final Environments](#shared-modules-database-for-staging-and-final-environments).

See also [Servers and Databases]({{site.baseurl}}/refs/servers-databases).

### DHF 4.0.1 Changes and Incompatibilities

DHF 4.0.1 introduces no incompatibilities with DHF 4.0.1. However, you should be aware of the following changes:

* [Shared Modules Database for Staging and Final Environments](#shared-modules-database-for-staging-and-final-environments)

#### Shared Modules Database for Staging and Final Environments

Projects created using DHF 4.0.0 are configured by default to provision one modules database for the **STAGING** App Server and another for the **FINAL** App Server. Projects created using DHF 4.0.1 and later share a modules database across the **STAGING** and **FINAL** App Servers.

The name of the gradle property that controls the modules database name has changed between DHF 4.0.0 and DHF 4.0.1. The new property name is `mlModulesDbName`. This is the same name used by DHF 2.x and DHF 3.x.

You do not need to modify your existing projects in response to this change, but any new projects you create will use this configuration.

If you plan to deploy your data hub application to a MarkLogic Data Hub Service cluster, you must use a shared modules database. For more details, see https://www.marklogic.com/product/marklogic-database-overview/data-hub-service/.
