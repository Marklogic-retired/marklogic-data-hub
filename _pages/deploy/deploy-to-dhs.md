---
layout: inner
title: Deploy to MarkLogic Data Hub Service
permalink: /deploy/deploy-to-dhs/
redirect_from: "/project/dhsdeploy/"
---

# Deploy to MarkLogic Data Hub Service

## Data Hub Service

You can deploy your DHF project in the cloud instead of setting up your own. The [MarkLogic Data Hub Service (DHS)](https://www.marklogic.com/blog/introducing-marklogic-data-hub-service/) is a cloud-based solution that provides a preconfigured MarkLogic cluster in which you can run flows and from which you can serve harmonized data.

In a DHS environment, the databases, app servers, and security roles are automatically set up. Admins can create user accounts.

{% include learn-about-dhs.html %}

{% include note.html type="TIP" content="Use DHF to develop your project locally then deploy it to DHS. You can have multiple DHS services that use the same DHF project files. For example, you can set up a DHS project as a testing environment and another as your production environment." %}


### Deploying a DHF Project to DHS

After you create and test your project locally (your development environment) using Data Hub Framework, you can deploy your project to a DHS cluster (your production environment).

DHF projects and DHS projects have different default configurations:

<!--
- mlFinalAppserverName

  |                      | DHF            | DHS            |
  |:--------------------:|:--------------:|:--------------:|
  | mlFinalAppserverName | data-hub-FINAL | data-hub-ADMIN |
  {:.table-b1gray}
-->

- Ports for app servers

  | app server  | DHF  | DHS  |
  |-------------|:----:|:----:|
  | staging     | 8010 | 8006 |
  | final <!-- /admin --> | 8011 | 8004 |
  | jobs        | 8013 | 8007 |
  {:.table-b1gray}

- Roles — The DHS roles are automatically created as part of provisioning your DHS environment. See [Data Hub Service Roles](https://cloudservices.marklogic.com/help?type=datahub&subtype=user#DHSroles).

  | DHF                 | DHS                 |
  |:-------------------:|:-------------------:|
  | `data-hub-role`     |                     |
  | `hub-admin-role`    |                     |
  |                     | `endpointDeveloper` |
  |                     | `endpointUser`      |
  |                     | `flowDeveloper`     |
  |                     | `flowOperator`      |
  {:.table-b1gray}

- Database names, if customized in the DHF environment

- Some DHS-only settings in the `gradle.properties` file, including `mlIsHostLoadBalancer` and `mlIsProvisionedEnvironment`, which are set to `true` to enable DHF to work correctly in DHS

If your endpoints are private, you need a bastion host inside a virtual private cloud (VPC) that can access the MarkLogic VPC. The bastion host securely relays:
- the requests from the outside world to MarkLogic
- the results from MarkLogic to the requester
<!-- See [Creating a Bastion Host in DHS](). -->

If your endpoints are publicly available, you can use any machine that is set up [as a peer of the MarkLogic VPC](https://cloudservices.marklogic.com/help?type=network#peer-role).

{% include note.html type="IMPORTANT" content="The DHF QuickStart tool cannot be used in DHS." %}


## Prerequisites

- A DHF project that has been set up and tested locally
- [A provisioned MarkLogic Data Hub Service environment](https://cloudservices.marklogic.com/help)
  - For private endpoints only: A bastion host inside a virtual private cloud (VPC)
  - Information from your DHS administrator:
    - Your DHS host name (typically, the curation endpoint)
    - REST curation endpoint URL (including port number) for testing
    - The username and password of the user account associated with each of the following roles. (See [Creating a User](https://cloudservices.marklogic.com/help?type=datahub&subtype=admin#manageusers).)
      - `endpointDeveloper`
      - `endpointUser`
      - `flowDeveloper`
      - `flowOperator`
      <!-- What security permissions/roles do they need to be able to create user accounts and assign them to these roles? -->
- [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp/install)


## Steps

1. Copy your entire DHF project directory to the machine from which you will access the endpoints, and perform the following steps on that machine.
    {% include note-in-list.html type="IMPORTANT" content="If your endpoints are private, this machine must be a bastion host." %}
1. Open a command-line window, and navigate to your DHF project root directory.
1. At your project root, create a new `gradle-DHS.properties` file.

    {% include note-in-list.html type="IMPORTANT" content="If you use a different name for the properties file, remember to update the value of the \"-PenvironmentName\" parameter in the Gradle commands in the following steps." %}

    a. Copy the following to the new file:

        mlDHFVersion=YOUR_DHF_VERSION
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

    b. Replace the values.

      | Key | Replace the value with ... |
      | --- | --- |
      | mlDHFVersion | The [DHF version](https://github.com/marklogic/marklogic-data-hub/releases) to use in your production environment. |
      | mlHost | The name of your DHS host. **Tip:** The host name is the domain name of the DHS final endpoint (remove 'http://' and the ':' and port number from the endpoint URL). |
      | mlUsername<br>mlPassword | The username and password of the user account assigned to the `flowOperator` role. **Note:** This can also be a user account assigned to the `flowDeveloper` role if additional permissions are required. |
      | mlManageUsername<br>mlManagePassword | The username and password of the user account assigned to the `flowDeveloper` role. |
      | ml*DbName | The names of the DHS databases, if customized. |
      | ml*AppserverName | The names of the DHS app servers, if customized. |
      | ml*Port | The ports that your DHS project is configured with, if not the defaults. |
      {:.table-b1gray}
1. Install the DHF core modules.

    {% include ostabs-run-gradle.html grtask="hubInstallModules -PenvironmentName=\"gradle-DHS.properties\"" %}

1. Install the plugins for your project.

    {% include ostabs-run-gradle.html grtask="mlLoadModules -PenvironmentName=\"gradle-DHS.properties\"" %}

1. If you are using DHF 4.0.2 or later, load the indexes in the DHS databases.

    {% include ostabs-run-gradle.html grtask="mlUpdateIndexes -PenvironmentName=\"gradle-DHS.properties\"" %}

1. [Run the input flows using MarkLogic Content Pump (MLCP).](https://marklogic.github.io/marklogic-data-hub/ingest/mlcp/)

    You can also use any of the following:
      - the [Java Client API](https://marklogic.github.io/marklogic-data-hub/ingest/marklogic-client-api/)
      - the [REST Client API](https://marklogic.github.io/marklogic-data-hub/ingest/rest/)
      - [Apache NiFi](https://developer.marklogic.com/code/apache-nifi) <!-- TODO: After DHFPROD-1542, replace this link. -->

1. Run the harmonization flows. <!-- Code from https://marklogic.github.io/marklogic-data-hub/harmonize/gradle/ -->

    {% include ostabs-run-gradle.html grtask="hubRunFlow -PentityName=\"My Awesome Entity\" -PflowName=\"My Harmonize Flow\" -PflowType=\"harmonize\"  -PenvironmentName=\"gradle-DHS.properties\"" %}

1. Verify that your documents are in the databases.

    a. In the following URLs, replace `REST-CURATION-ENDPOINT-URL` with the REST curation endpoint URL from your DHS administrator.

      | Final database   | `http://REST-CURATION-ENDPOINT-URL:8010/v1/search?database=data-hub-FINAL`   |
      | Staging database | `http://REST-CURATION-ENDPOINT-URL:8010/v1/search?database=data-hub-STAGING` |
      {:.table-b1gray}

      **Example:** `http://internal-mlaas-xxx-xxx-xxx.us-west-2.elb.amazonaws.com:8010/v1/search?database=data-hub-FINAL`

      {% include note-in-list.html type="TIP" content="Narrow the search to return fewer items. See [MarkLogic REST API Search](https://docs.marklogic.com/REST/GET/v1/search)." %}

    b. In a web browser, navigate to one of the URLs.

      The result is an XML list of all your documents in the database. Each item in the list includes the document's URI, path, and other metadata, as well as a preview of the content.


## Remarks
If you update your flows after the initial project upload, you can redeploy your flow updates by running `gradle mlLoadModules` again and then running the flows.


## See Also
- [DHS-e2e](https://github.com/marklogic/marklogic-data-hub/tree/develop/examples/DHS-e2e) — An end-to-end example of deploying from DHF to DHS
- [Data Hub Service Online Help](https://cloudservices.marklogic.com/help?type=datahub)
- [Getting Started with Data Hub Service (DHS) on AWS](https://developer.marklogic.com/learn/data-hub-service-aws)
