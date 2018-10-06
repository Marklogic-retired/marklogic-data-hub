---
layout: inner
title: Property Reference
permalink: /docs/gradleproperties/
---

This page provides information about the gradle properties that are
needed by the hub to install and run properly.

## Data Hub Specific Properties

| Property  | Description |
| --- | --- |
| mlStagingAppserverName | The Application Server name used for the Staging Database. | 
| mlStagingPort | Specifies the port to be used by the Staging App Server. |
| mlStagingDbName | Specifies the name for the Staging Database. |
| mlStagingForestsPerHost | Specifies the number of forests per host for the Staging Database. |
| mlFinalAppserverName | The Application Server name used for the Final Database. | 
| mlFinalPort | Specifies the port to be used by the Final App Server. |
| mlFinalDbName | Specifies the name for the Final Database. |
| mlFinalForestsPerHost | Specifies the number of forests per host for the Final Database. |
| mlJobAppserverName | The Application Server name used for the Jobs Database. | 
| mlJobPort | Specifies the port to be used by the Jobs App Server. |
| mlJobDbName | Specifies the name for the Jobs Database. |
| mlJobForestsPerHost | Specifies the number of forests per host for the Jobs Database. |
| mlModulesDbName | The Modules Database to be used along with Staging, Final and Jobs App Server. |
| mlStagingTriggersDbName | The Triggers Database to be used along with Staging App Server. |
| mlStagingSchemasDbName | The Schemas Database to be used along with Staging App Server. |
| mlFinalTriggersDbName | The Triggers Database to be used along with Final App Server. |
| mlFinalSchemasDbName | The Schemas Database to be used along with Final App Server. |
| mlModulePermissions | Comma-delimited string of role/capability/role/capability/etc that defines permissions for deployed Modules. |
| mlIsHostLoadBalancer | Indicates if the value specified for "mlHost" should be treated as a load balancer or not. |

Note: Any other properties are conformant to the `ml-gradle` properties and can be referenced via `ml-gradle` [Property Reference](https://github.com/marklogic-community/ml-gradle/wiki/Property-reference)