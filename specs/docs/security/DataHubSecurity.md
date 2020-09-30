---
tags: [security]
---

# Data Hub Security

This document briefly covers best practices to follow in MarkLogic security with links to more indepth documentation. In addition, this document covers the privileges given to each role and the rationale behind the assigned privilege.

## MarkLogic Security Practices

### Checking Execute Privileges

Execute privileges are used to protect functions from being called by users without the proper level of authorization. Functions can be guarded by calling the [`xdmp.securityAssert`](https://docs.marklogic.com/xdmp.securityAssert) function at the beginning of its execution to ensure the user has the proper execution privileges. See [Protecting Your XQuery and JavaScript Code with Execute Privileges](https://docs.marklogic.com/guide/security/execute#id_69547).

#### Example xdmp.securityAssert call
```javascript
xdmp.securityAssert("http://marklogic.com/data-hub/function-access", "execute");
```

### Granting Privileges To Function Via Amps

Execute privileges for a given role should never be broader than needed for the operations a role needs to execute. Amps are a way to grant temporary roles inside a designated function. The function can then institute guardrails to ensure the roles are only used for the narrow intended purpose. See [Temporarily Increasing Privileges with Amps](https://docs.marklogic.com/guide/security/execute#id_54880).

#### Example amp configuration
```javascript
{
  "local-name" : "updateJob",
  "document-uri" : "/data-hub/5/impl/jobs.sjs",
  "modules-database" : "%%mlModulesDbName%%",
  "role" : [ "data-hub-job-internal" ]
}
```

In JavaScript, in addition to the amp configuration file, you need to make use of the `module.amp` function to wrap your function on export. See [Amps and the module.amp Function](https://docs.marklogic.com/guide/jsref/functions#id_13020) 

#### Example JavaScript amp using module.amp
```javascript
module.exports.updateJob = module.amp(
  function updateJob(datahub, jobId, status, flow, step, lastCompleted, stepResponse) {
  //...
  }
);
```
### When To Grant Privileges To User Roles And When To Use Amps

User roles should be assigned privileges when the privilege is sufficiently restrictive and does not allow arbitrary code execution.

If the privilege would allow arbitrary code execution, that is a sure indication that an amp should be used. For other privileges, consider if the privilege can be used beyond the intended purpose. Where possible use granular privileges (See [Granular Privileges](https://docs.marklogic.com/guide/security/granular)). If the user role can't use granular privileges and the required privilege would be too broad, (1) a new narrow execute privilege should be created, (2) the function that requires the privilege should check for the narrow privilege, and (3) the function should be amped with the broader privilege.

Roles to be used with amps should be suffixed with `-internal` to indicate that the role is used for amps and NOT intended to be assigned to users.

## Data Hub Roles, Privileges, and Authorities

### data-hub-common

Data Hub role containing the common privileges across Data Hub roles.

#### Inherited Roles
 - data-hub-module-reader
 - rest-reader
 - rest-extension-user

#### Privileges

Privilege | Notes
---------|----------
 xdmp-eval-in | Required to specify database for REST Client. (Note: This privilege alone doesn't allow eval to be called. The REST API code does the neccesary amping for eval execution)
 xdbc-eval-in | Same as xdmp-eval-in

### data-hub-common-writer

Data Hub role containing the common privileges across Data Hub writer roles.

#### Inherited Roles
 - data-hub-common

#### Privileges

Privilege | Notes
---------|----------
 ps-user | Needed to record provenance data
 xdmp-document-load | Needed to load data directly in the database
 any-uri | Required to write documents to any URI without explicit privileges granted
 any-collection | Required to write documents to any collection without explicit privileges granted
 rest-writer | Required to perform write operations via the REST API

### hub-central-user

All Data Hub roles intended for Hub Central users inherit this role.

#### Associate Authorities
 - loginToHubCentral

#### Inherited Roles
 - data-hub-common

### hub-central-downloader

Role to determine if a user can download the Hub Central project.

#### Associate Authorities
 - downloadProjectFiles

#### Inherited Roles
 - data-hub-common

### hub-central-clear-user-data

Role to determine if a user can clear their data through Hub Central.

#### Associate Authorities
 - clearUserData

#### Inherited Roles
 - data-hub-common-writer

### hub-central-step-runner

Can run steps through Hub Central

#### Associate Authorities
 - readFlow
 - runStep

#### Inherited Roles
 - hub-central-user
 - data-hub-common-writer
 - data-hub-flow-reader
 - data-hub-ingestion-reader
 - data-hub-mapping-reader
 - data-hub-match-merge-reader
 - data-hub-step-definition-reader

### hub-central-step-writer

Can create and run steps though Hub Central

#### Associate Authorities
 - writeFlow

#### Inherited Roles
 - hub-central-step-runner
 - data-hub-common-writer
 - data-hub-flow-writer

### hub-central-load-reader

Can read load data artifacts through Hub Central

#### Associate Authorities
 - readIngestion

#### Inherited Roles
 - hub-central-user
 - data-hub-ingestion-reader

### hub-central-load-writer

Can read and write load data artifacts through Hub Central

#### Associate Authorities
 - writeIngestion

#### Inherited Roles
 - hub-central-load-reader
 - data-hub-common-writer
 - data-hub-ingestion-writer

### hub-central-mapping-reader

Can read mapping artifacts through Hub Central

#### Associate Authorities
 - readMapping

#### Inherited Roles
 - hub-central-user
 - data-hub-mapping-reader

### hub-central-mapping-writer

Can read and write mapping artifacts through Hub Central

#### Associate Authorities
 - writeMapping

#### Inherited Roles
 - hub-central-mapping-reader
 - data-hub-common-writer
 - data-hub-mapping-writer

### hub-central-match-merge-reader

Can read match and merge artifacts through Hub Central

#### Associate Authorities
 - readMatching
 - readMerging

#### Inherited Roles
 - hub-central-user
 - data-hub-match-merge-reader

### hub-central-match-merge-writer

Can read and write match and merge artifacts through Hub Central

#### Associate Authorities
 - writeMatching
 - writeMerging

#### Inherited Roles
 - hub-central-match-merge-reader
 - data-hub-common-writer
 - data-hub-match-merge-writer

### hub-central-custom-reader

Can read custom artifacts through Hub Central

#### Associate Authorities
 - readCustom

#### Inherited Roles
 - hub-central-user
 - data-hub-step-definition-reader

### hub-central-custom-writer

Can read and write custom artifacts through Hub Central

#### Associate Authorities
 - writeCustom

#### Inherited Roles
 - hub-central-custom-reader
 - data-hub-common-writer
 - data-hub-step-definition-writer
 - data-hub-module-writer

### hub-central-developer

Can create any type of step and run steps through Hub Central

#### Inherited Roles
 - hub-central-operator
 - hub-central-step-writer
 - hub-central-load-writer
 - hub-central-mapping-writer
 - hub-central-match-merge-writer
 - hub-central-custom-writer
 - hub-central-downloader

### hub-central-operator

Can view the entire configuration and run steps through Hub Central

#### Inherited Roles
 - hub-central-user
 - hub-central-flow-reader
 - hub-central-load-reader
 - hub-central-mapping-reader
 - hub-central-match-merge-reader
 - hub-central-custom-reader
 - hub-central-step-runner

## Authorities

Authorities describe the actions a user can take in Hub Central. The list of authorities provided by the `/data-hub/5/data-services/security/getAuthorities.sjs` Data Service should be used to protect APIs in the Hub Central middle-tier. This should be done using the Spring Security annotation "[@Secured](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/access/annotation/Secured.html)".

