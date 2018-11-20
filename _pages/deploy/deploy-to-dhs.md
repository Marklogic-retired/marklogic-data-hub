---
layout: inner
title: Deploy to MarkLogic Data Hub Service
permalink: /deploy/deploy-to-dhs/
---

## Data Hub Service

You can use [MarkLogic Data Hub Service (DHS)](https://www.marklogic.com/blog/introducing-marklogic-data-hub-service/) as your production environment instead of setting up your own. DHS is a cloud-based solution that provides a preconfigured MarkLogic cluster in which you can run flows and from which you can serve harmonized data.

In a DHS environment, the databases, app servers, security roles, user accounts, and passwords must be provisioned by the DHS administrators.

To learn more about DHS, see [MarkLogic Data Hub Service](http://www.marklogic.com/product/marklogic-database-overview/data-hub-service/) and [the DHS documentation](https://cloudservices.marklogic.com/help?type=datahub).

<!--
{:.note-note} NOTE: DHS is not intended as a development environment.
But https://cloudservices.marklogic.com/help?type=datahub&subtype=user#VPC says:
"Note: Use the MarkLogic Data Hub Service for Data Hub Framework development and proof of concept projects."
-->


## Deploying a DHF Project to DHS

If you created and tested your project locally (your development environment) using Data Hub Framework, deploying your project to a DHS cluster (your production environment) is a simple process.

The project properties in DHF and in DHS have the following differences.

- Ports for app servers
    | endpoint | DHF  | DHS  |
    |----------|------|------|
    | staging  | 8010 | 8006 |
    | final    | 8011 | 8004 |
    | jobs     | 8013 | 8007 |
- Roles
    | DHF                 | DHS                 |
    |---------------------|---------------------|
    | `data-hub-role`     |                     |
    | `hub-admin-role`    |                     |
    |                     | `endpointDeveloper` |
    |                     | `endpointUser`      |
    |                     | `flowDeveloper`     |
    |                     | `flowOperator`      |
    {:.note-note} NOTE: The DHS roles are automatically created as part of provisioning your DHS project.
    See [Data Hub Service Roles](https://cloudservices.marklogic.com/help?type=datahub&subtype=user#DHSroles).
- Database names, if customized in the local environment
- Some settings in the `gradle.properties` file, including `mlIsHostLoadBalancer` and `mlIsProvisionedEnvironment`

To make your endpoints private, you need a bastion host inside a virtual private network (VPN) that can access the MarkLogic VPN. The bastion host securely relays:
    - the requests from the outside world to MarkLogic
    - the results from MarkLogic to the requester
See [Creating a Bastion Host in DHS](???).

To keep your endpoints publicly available, you can use any machine that is set up [as a peer of the MarkLogic VPN](https://cloudservices.marklogic.com/help?type=network#peer-role).

{:.note-note} *NOTE:* The DHF QuickStart tool cannot be used in a production environment.


### Prerequisites

- A DHF project that has been set up and tested locally
- [A provisioned MarkLogic Data Hub Service project](https://cloudservices.marklogic.com/help)
  - For private endpoints,
    - A bastion host inside a virtual private network (VPN)
    - Information from your DHS administrator:
      - your DHS host name
      - the username and password for the user account assigned to the `flowDeveloper` role
      - the username and password for the user account assigned to the `flowOperator` role
      - REST curation endpoint URL (including port number) for testing
  - For public endpoints,
    - Information from your DHS administrator:
      - your DHS host name
      - REST curation endpoint URL (including port number) for testing
    - At least one user account associated with each of the following roles:
      - `flowDeveloper`
      - `flowOperator`
      See [Creating a User](https://docs.marklogic.com/guide/admin/security#id_58960).
- [Gradle 4.x+](https://docs.gradle.org/current/userguide/installation.html#installing_gradle)
- [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp/install)


### Steps

1. If using a bastion host, copy your entire DHF project folder to the bastion host, where you will perform the following steps.
1. In the root of your DHF project folder, edit the `gradle.properties` file.
    a. Replace the entire contents of `gradle.properties` with the following:
        ```
        mlDHFVersion=4.0.3
        mlHost=YOUR_DHS_HOSTNAME

        mlIsHostLoadBalancer=true

        mlUsername=YOUR_FLOW_OPERATOR_USER
        mlPassword=YOUR_FLOW_OPERATOR_PASSWORD
        mlManageUsername=YOUR_FLOW_DEVELOPER_USER
        mlManagePassword=YOUR_FLOW_DEVELOPER_PASSWORD

        mlStagingAppserverName=data-hub-STAGING
        mlStagingPort=8006
        mlStagingDbName=data-hub-STAGING
        mlStagingForestsPerHost=1

        mlFinalAppserverName=data-hub-ADMIN
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
    b. Replace the values.
        | Key | Replace the value with ... |
        | --- | --- |
        | mlDHFVersion | The [DHF version](https://github.com/marklogic/marklogic-data-hub/releases) to use in your production environment. |
        | mlHost | The name of your DHS host. |
        | mlUsername<br>mlPassword | The username and password of the user account assigned to the `flowOperator` role. |
        | mlManageUsername<br>mlManagePassword | The username and password of the user account assigned to the `flowDeveloper` role. |
        | ml*DbName | The names of the databases, if customized. |
        | ml*AppserverName | The names of the DHS app servers, if customized. |
        | ml*Port | The ports that your DHS project is configured with, if not the defaults. |
1. Install the DHF core modules.
    ```
    gradle hubInstallModules
    ```
1. Install the plugins for your project.
    ```
    gradle mlLoadModules
    ```
1. [Run the input flows using MarkLogic Content Pump (MLCP).](https://marklogic.github.io/marklogic-data-hub/ingest/mlcp/)
1. Run the harmonization flows. <!-- Code from https://marklogic.github.io/marklogic-data-hub/harmonize/gradle/ -->
    {% include ostabs.html 
        linux="./gradlew hubRunFlow -PentityName=\"My Awesome Entity\" -PflowName=\"My Harmonize Flow\" -PflowType=\"harmonize\"" 
        windows="gradlew.bat hubRunFlow -PentityName=\"My Awesome Entity\" -PflowName=\"My Harmonize Flow\" -PflowType=\"harmonize\"" 
    %}
1. To verify that your documents are in the databases, replace `curation-endpoint-url` and the port number in the following URL and navigate to it.
    | Final database   | `http://curation-endpoint-url:8004/v1/search?database=data-hub-FINAL`   |
    | Staging database | `http://curation-endpoint-url:8004/v1/search?database=data-hub-STAGING` |
    *Example:* `"http://internal-mlaas-xxx-xxx-xxx.us-west-2.elb.amazonaws.com:8004/v1/search?database=data-hub-FINAL`


## See Also
- [Data Hub Service Online Help](https://cloudservices.marklogic.com/help?type=datahub)
- [Getting Started with Data Hub Service (DHS) on AWS](https://developer.marklogic.com/learn/data-hub-service-aws)
