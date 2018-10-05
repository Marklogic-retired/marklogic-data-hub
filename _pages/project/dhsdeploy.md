---
layout: inner
title: Deploying to a Data Hub Service
permalink: /project/dhsdeploy/
---

You can use a MarkLogic Data Hub Service (DHS) managed cluster as a production deployment environment for an application based on Data Hub Framework. DHS is a cloud-based solution that provides a pre-configured MarkLogic cluster in which you can deploy DHF flows and harmonized data. DHS is not intended for development deployment.

When you deploy a DHF project into a DHS environment, the databases, App Servers, and security roles, users, and passwords are already provisioned by the DHS adminstrators. Deploying DHF simply deploys the DHF library, your flows, transforms, and other customizations.

To learn more about DHS, see http://www.marklogic.com/product/marklogic-database-overview/data-hub-service/.

Deploying to a DHF project to a Data Hub Service cluster requires a specific set of gradle properties. Use the example below as a template for your `gradle.properties`. Notes on what to modify appear after the example.

```
mlDHFVersion=4.0.1
mlHost=YOUR_DHS_HOSTNAME

mlIsHostLoadBalancer=true

mlUsername=YOUR_FLOW_DEVELOPER_USER
mlPassword=YOUR_FLOW_DEVELOPER_PASSWORD
mlManageUsername=YOUR_FLOW_OPERATOR_USER
mlManagePassword=YOUR_FLOW_OPERATOR_PASSWORD

mlStagingAppserverName=data-hub-STAGING
mlStagingPort=8006
mlStagingDbName=data-hub-STAGING
mlStagingForestsPerHost=1

mlFinalAppserverName=data-hub-FINAL
mlFinalPort=8004
mlFinalDbName=data-hub-FINAL
mlFinalForestsPerHost=1

mlJobAppserverName=data-hub-JOBS
mlJobPort=8007
mlJobDbName=data-hub-JOBS
mlJobForestsPerHost=1

mlModulesDbName=data-hub-MODULES
mlStagingTriggersDbName=data-hub-staging-TRIGGERS
mlStagingSchemasDbName=data-hub-staging-SCHEMAS

mlFinalTriggersDbName=data-hub-final-TRIGGERS
mlFinalSchemasDbName=data-hub-final-SCHEMAS

mlModulePermissions=flowDeveloper,read,flowDeveloper,execute,flowDeveloper,insert,flowOperator,read,flowOperator,execute,flowOperator,insert

mlIsProvisionedEnvironment=true
```
You will need to change the value of at least the following properties:

* `mlHost`: Use the hostname of your
* `mlUsername` and `mlPassword`: The DHS administrator should provide you credentials for a user with the DHS `FlowOperator` role.
* `mlManageUsername` and `mlManagePassword`: The DHS administrator should provide you credentials for a user with the DHS `FlowDeveloper` role.
