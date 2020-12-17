This example project demonstrates where to store resources that can be deployed to a DHS instance using a user with the 
data-hub-developer role, or the data-hub-security-admin role, or both. 

This project is not meant to be deployed. It is intended only to serve as a reference for where resource files
should be stored. Because of this, it also does not define any Data Hub artifacts, such as flows or entities.

## General deployment guidelines

The tasks for deploying resources to DHS will never read from the src/main/hub-internal-config directory. The 
resources in that directory are deployed automatically within DHS. For example, if you have defined your configuration
directories via the following property:

    mlConfigPaths=src/main/hub-internal-config,src/main/ml-config,src/main/other-config
    
The ml-config and other-config directories will still be processed, but hub-internal-config will not be.

## Deploying resources as a data-hub-security-admin user

As of 5.2.0, a user with the data-hub-security-admin role is permitted to deploy roles that grant privileges that are
inherited by the user performing the deployment. As an example of this, the 
src/main/ml-config/security/roles/custom-role1.json file defines a new role with the "role-set-external-names" privilege, which is 
inherited by the data-hub-security-admin role. 

Permitted resources can be deployed via the following task (assuming that gradle-dhs.properties defines the host and
credentials for the DHS instance):

    ./gradlew -PenvironmentName=dhs hubDeployAsSecurityAdmin
    
## Deploying resources as a data-hub-developer user

As of 5.2.0, a user with the data-hub-developer is permitted to deploy the following resources:

- Indexes to the data-hub-STAGING, data-hub-FINAL, and data-hub-JOBS databases
- Artifacts (entities, flows, mappings, and step definitions)
- Modules
- Alert configs, rules, and actions
- Scheduled tasks
- Schemas
- Temporal axes and collections
- Triggers

Permitted resources can be deployed via the following task (assuming that gradle-dhs.properties defines the host and
credentials for the DHS instance):

    ./gradlew -PenvironmentName=dhs hubDeployAsDeveloper
    
Additionally, if your user has both the data-hub-developer and data-hub-security-admin roles, then you can run the 
following task, which simply invokes both of the above tasks:

    ./gradlew -PenvironmentName=dhs hubDeploy

Each of the permitted resources is described below in more detail.

### Database indexes

Each database file that references data-hub-STAGING, data-hub-FINAL, and data-hub-JOBS will be processed. Database files
are located in the "./databases" directory in a configuration directory. In this example project, the "test-database.json"
file will not be processed since it does not reference one of those 3 databases. Also see 
[the ml-gradle docs](https://github.com/marklogic-community/ml-gradle/wiki/Resource-reference#databases) for more information.

## Artifacts

Equivalent to on-premise deployment, all Data Hub artifacts in the ./entities, ./flows, ./mappings, and 
./step-definitions directories will be deployed.

## Modules

All user modules in any directory specified by mlModulePaths (defaults to src/main/ml-modules) will be deployed. Contrary
to an on-premise deployment, the Data Hub modules themselves are not deployed. These are instead deployed automatically
within the DHS instance. Also see [the ml-gradle docs](https://github.com/marklogic-community/ml-gradle/wiki/How-modules-are-loaded) for more information. 

## Alert resources

Alert resource files - configs, alerts, and rules - are stored in the directory "./databases/(name of content database)/alerts". 
See src/main/ml-config/databases/data-hub-FINAL/alert for an example in this project. Also see 
[the ml-gradle docs](https://github.com/marklogic-community/ml-gradle/wiki/Resource-reference#alerting) for more information.

## Schemas 

Schema files are stored in the directory "./databases/(name of schema database)/schemas". See 
src/main/ml-config/databases/data-hub-staging-SCHEMAS/schemas for an example in this project. Also see 
[the ml-gradle docs](https://github.com/marklogic-community/ml-gradle/wiki/Loading-schemas) for more information. 

## Scheduled tasks

Because a DHS instance uses multiple groups for application servers, and because a scheduled task is associated with a
group, scheduled task files are stored in the directory "./tasks/(name of group)". See 
src/main/ml-config/tasks for an example in this project. Also see
[the ml-gradle docs](https://github.com/marklogic-community/ml-gradle/wiki/Resource-reference#scheduled-tasks) for more information.

## Temporal axes and collections

Temporal axes and collections files are stored in the directory "./databases/(name of content database)/temporal". 
See src/main/ml-config/databases/data-hub-FINAL/temporal for an example in this project. Also see
[the ml-gradle docs](https://github.com/marklogic-community/ml-gradle/wiki/Resource-reference#temporal) for more information.

## Triggers

Trigger files are stored in the directory "./databases/(name of triggers database)/triggers". See 
src/main/ml-config/databases/data-hub-final-TRIGGERS/triggers for an example in this project. Also see 
[the ml-gradle docs](https://github.com/marklogic-community/ml-gradle/wiki/Resource-reference#triggers) for more information.

