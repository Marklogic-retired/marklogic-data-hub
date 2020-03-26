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

## Data Hub Roles and Privileges

### data-hub-login

All Data Hub roles intended for Hub Central users inherit this role.

#### Inherited Roles
 - data-hub-module-reader

#### Privileges

Privilege | Notes
---------|----------
 xdmp-eval-in | Required to specify database for REST Client. (Note: This privilege alone doesn't allow eval to be called. The REST API code does the neccesary amping for eval execution)
 xdbc-eval-in | Same as xdmp-eval-in
 rest-reader | Required for REST Client use

### data-hub-flow-reader 

#### Inherited Roles
 - data-hub-login

#### Privileges

Privilege | Notes
---------|----------
 xdmp-document-load | Needed to load data directly in the database
 rest-writer | Needed to write documents as part of a flow run
 any-uri | Required to write documents to any URI without explicit privileges granted
 any-collection | Required to write documents to any collection without explicit privileges granted

### data-hub-flow-writer

#### Inherited Roles
 - data-hub-flow-reader


