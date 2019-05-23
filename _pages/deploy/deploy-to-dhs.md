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

DHF projects and DHS projects have the following default configurations:

- Ports and load balancers for app servers

  | app servers | ports | DHS load balancers |
  |-------------|:-----:|:------------------:|
  | staging     | 8010  | curation           |
  | final       | 8011  | operations         |
  | jobs        | 8013  | analytics          |
  {:.table-b1gray}

  {% include note.html type="IMPORTANT" content="Use port 8004 to deploy the Data Hub Framework core **only**. To deploy custom plugins (REST extensions, search options, etc.) against the FINAL database, use port 8011." %}

- Roles — The DHS roles are automatically created as part of provisioning your DHS environment. See [Data Hub Service Roles](https://cloudservices.marklogic.com/help?type=datahub&subtype=user#DHSroles).

  | DHF                   | DHS                 |
  |:---------------------:|:-------------------:|
  | `data-hub-admin`      |                     |
  |                       | `endpointDeveloper` |
  |                       | `endpointUser`      |
  | `flow-developer-role` | `flowDeveloper`     |
  | `flow-operator-role`  | `flowOperator`      |
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


## Procedure

1. Copy your entire DHF project directory to the machine from which you will access the endpoints, and perform the following steps on that machine.
    {% include note-in-list.html type="IMPORTANT" content="If your endpoints are private, this machine must be a bastion host." %}
1. Open a command-line window, and navigate to your DHF project root directory.
1. At your project root, create a new `gradle-DHS.properties` file.

    **NOTE:** If you use a different name for the properties file,
      - The filename must be in the format `gradle-{env}.properties`, where `{env}` is any string you want to represent an environment. For example, you can store the settings for your development environment in `gradle-dev.properties`.
      - Remember to update the value of the `-PenvironmentName` parameter to `{env}` in the Gradle commands in the following steps.

    a. Copy the following to the new file:

        mlDHFVersion=YOUR_DHF_VERSION
        mlHost=YOUR_DHS_HOSTNAME

        mlIsHostLoadBalancer=true

        mlUsername=YOUR_FLOW_OPERATOR_USER
        mlPassword=YOUR_FLOW_OPERATOR_PASSWORD
        mlManageUsername=YOUR_FLOW_DEVELOPER_USER
        mlManagePassword=YOUR_FLOW_DEVELOPER_PASSWORD

        mlStagingAppserverName=data-hub-STAGING
        mlStagingPort=8010
        mlStagingDbName=data-hub-STAGING
        mlStagingForestsPerHost=1

        mlFinalAppserverName=data-hub-FINAL
        mlFinalPort=8011
        mlFinalDbName=data-hub-FINAL
        mlFinalForestsPerHost=1

        mlJobAppserverName=data-hub-JOBS
        mlJobPort=8013
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
   {% include ostabs-run-gradle.html grtask="hubInstallModules -PenvironmentName=DHS" %}
1. Install the plugins for your project.
   {% include ostabs-run-gradle.html grtask="mlLoadModules -PenvironmentName=DHS" %}
1. If you are using DHF 4.0.2 or later, load the indexes in the DHS databases.
   {% include ostabs-run-gradle.html grtask="mlUpdateIndexes -PenvironmentName=DHS" %}
1. [Run the input flows using MarkLogic Content Pump (MLCP).](https://marklogic.github.io/marklogic-data-hub/ingest/mlcp/)

    You can also use any of the following:
      - the [Java Client API](https://marklogic.github.io/marklogic-data-hub/ingest/marklogic-client-api/)
      - the [REST Client API](https://marklogic.github.io/marklogic-data-hub/ingest/rest/)
      - [Apache NiFi](https://developer.marklogic.com/code/apache-nifi) <!-- TODO: After DHFPROD-1542, replace this link. -->

1. Run the harmonization flows. <!-- Code from https://marklogic.github.io/marklogic-data-hub/harmonize/gradle/ -->
   {% include ostabs-run-gradle.html grtask="hubRunFlow -PentityName=MyAwesomeEntity -PflowName=MyHarmonizeFlow -PflowType=harmonize -PenvironmentName=DHS" %}

   {% include conrefs/conref-note-gradle-double-quotes.md %}

1. Verify that your documents are in the databases.

    a. In the following URLs, replace `OPERATIONS-REST-ENDPOINT-URL` and `CURATION-REST-ENDPOINT-URL` with the appropriate endpoint URLs from your DHS administrator.

      | Final database   | `http://OPERATIONS-REST-ENDPOINT-URL:8011/v1/search` |
      | Staging database | `http://CURATION-REST-ENDPOINT-URL:8010/v1/search`   |
      {:.table-b1gray}

      **Example:** `http://internal-mlaas-xxx-xxx-xxx.us-west-2.elb.amazonaws.com:8011/v1/search`

      {% include note-in-list.html type="TIP" content="Narrow the search to return fewer items. See [MarkLogic REST API Search](https://docs.marklogic.com/REST/GET/v1/search)." %}

    b. In a web browser, navigate to one of the URLs.

      The result is an XML list of all your documents in the database. Each item in the list includes the document's URI, path, and other metadata, as well as a preview of the content.
{:.ol-steps}


## Remarks
If you update your flows after the initial project upload, you can redeploy your flow updates by running `gradle mlLoadModules` again and then running the flows.


## See Also
- [DHS-e2e](https://github.com/marklogic/marklogic-data-hub/tree/develop/examples/DHS-e2e) — An end-to-end example of deploying from DHF to DHS
- [Data Hub Service Online Help](https://cloudservices.marklogic.com/help?type=datahub)
- [Getting Started with Data Hub Service (DHS) on AWS](https://developer.marklogic.com/learn/data-hub-service-aws)
