---
layout: inner
title: Deploying to a Data Hub Service
permalink: /project/dhsdeploy/
---

You can use a MarkLogic Data Hub Service (DHS) managed cluster as a production deployment environment for an application based on Data Hub Framework. DHS is a cloud-based solution that provides a pre-configured MarkLogic cluster in which you can deploy DHF flows and harmonized data. DHS is not intended for development deployment.

When you deploy a DHF project into a DHS environment, the databases, App Servers, and security roles, users, and passwords are already provisioned by the DHS adminstrators. Deploying DHF simply deploys the DHF library, your flows, transforms, and other customizations.

To learn more about DHS, see http://www.marklogic.com/product/marklogic-database-overview/data-hub-service/.

Deploying a DHF project to a DHS cluster requires the following project configuration differences:

## Changes to Provisioning Users and Roles

When deploying into a DHS environment, usernames, passwords, and roles are defined by the DHS Data Hub Security Admin. Your project should not define the following gradle properties:

* `mlUsername` and `mlPassword`. The DHS administrator will provide an equivalent user with the DHS `FlowOperator` role.
* `mlManageUsername` and `mlManagePassword`. The DHS administrator will provide an equivalent user with the DHS `FlowDeveloper` role.
* `mlSecurityUsername` and `mlSecurityPassword`
* `mlHubUserRole`, `mlHubUserName`, and `mlHubUserPassword`

## Required Modules Database Permissions
DHF and custom code deployed to the DHS modules database must be inserted into the database with a specific set of permissions that fits the DHS security model. Therefore, your `gradle.properties` file must include the following when deploying into a Data Hub Service environment:
```
mlModulePermissions=flowDeveloper,read,flowDeveloper,execute,flowDeveloper,insert,flowOperator,read,flowOperator,execute,flowOperator,insert
```
