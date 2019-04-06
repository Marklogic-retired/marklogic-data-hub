---
layout: inner
title: Gradle Properties
permalink: /refs/gradle-properties/
redirect_from: "/docs/gradleproperties/"
---

# Gradle Properties

The following are DHF-specific Gradle properties required by the data hub to install and run properly.

| Property  | Description |
| --- | --- |
| mlStagingAppserverName | The application server name used for the staging database. |
| mlStagingPort | Specifies the port to be used by the staging app server. |
| mlStagingDbName | Specifies the name for the staging database. |
| mlStagingForestsPerHost | Specifies the number of forests per host for the staging database. |
| mlFinalAppserverName | The application server name used for the final database. |
| mlFinalPort | Specifies the port to be used by the final app server. |
| mlFinalDbName | Specifies the name for the final database. |
| mlFinalForestsPerHost | Specifies the number of forests per host for the final database. |
| mlJobAppserverName | The application server name used for the jobs database. |
| mlJobPort | Specifies the port to be used by the jobs app server. |
| mlJobDbName | Specifies the name for the jobs database. |
| mlJobForestsPerHost | Specifies the number of forests per host for the jobs database. |
| mlModulesDbName | The modules database to be used along with the staging, final, and jobs app servers. |
| mlStagingTriggersDbName | The triggers database to be used along with the staging app server. |
| mlStagingSchemasDbName | The schemas database to be used along with the staging app server. |
| mlFinalTriggersDbName | The triggers database to be used along with the final app server. |
| mlFinalSchemasDbName | The schemas database to be used along with the final app server. |
| mlModulePermissions | Comma-delimited string of role/capability/role/capability/etc. that defines permissions for deployed modules. |
| mlIsHostLoadBalancer | Indicates if the value specified for `mlhost` should be treated as a load balancer or not. |
| mlFlowOperatorRole<br/> mlFlowOperatorUserName<br/> mlFlowOperatorUserPassword | (For v4.3 or later) The role, username, and password associated with the account to use to run flows in the production environment. |
| mlFlowDeveloperRole<br/> mlFlowDeveloperUserName<br/> mlFlowDeveloperUserPassword | (For v4.3 or later) The role, username, and password associated with the account to use to create and deploy flows to the production environment. |
{:.table-b1gray}

{% include note.html type="NOTE" content="Other properties conform to the ml-gradle properties. See [the ml-gradle Property Reference](https://github.com/marklogic-community/ml-gradle/wiki/property-reference)" %}
