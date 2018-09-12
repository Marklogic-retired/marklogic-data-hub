---
layout: inner
title: Security
permalink: /docs/security/
---

This page provides information about the roles, privileges and users that are
involved in a data hub.


1. [Privileges, users, roles, permissions](#overview)
1. [Runtimes](#runtimes)
1. [Roles](#roles)
1. [Users](#users)

## Privileges, roles, perimssions

MarkLogic has a three-part security model, which is described in-depth in the 
[Security Guide](https://docs.marklogic.com/guide/security)

Privileges are named capabilities.  When a user is or is not allowed to DO something with MarkLogic server, a privilege is involved.

Roles are structures for grouping security concerns.  A role contains a set of privileges that the role allows, and also may contain names of other roles from which it inherits sets of privileges.  Roles also have "default permissions."  A document, whose write is secured by a role, will be written with this set of default permissions.

Users correspond to people or to accounts that access MarkLogic.  They have credentials, and a set of roles and/or privileges that they possess.  Therefore when a user logs in, they can or cannot accomplish certain tasks within the system, they have access to some documents and not others, and when they write documents, certain default permissions are ascribed to that document.



## Runtimes

There are two very distinct environments in which DHF might run.  One is that of developing flows, when you need to modify mappings and flows, test index settings, and re-deploy the hub frequently.  This scenario requires many privileges that normally would not be in the hands of an end user.

The other environment for DHF code is a production or production-like setting.  In this setting, all code to run DHF will have been deployed to a server.  There may be a Java application triggering flows, but such an environment is just that -- a restricted user executes code that runs flows.  This user certainly has permission to write documents, and even to evaluate across databases, but she cannot deploy modules or reconfigure MarkLogic.


## Roles

For the first scenario, DHF provides an administrative role.  By default the name of this role is "hub-admin-role".  When the data hub is initially installed, the project's properties are scanned for the `mlHubAdminUserRole` property, and if present, that value overrides "hub-admin-role".  Use "hub-admin-role" for development purposes.  It does not have administrative access to the entire MarkLogic server, but has enough to deploy and undeploy code from a data hub.

For the second scenario, DHF provides a role to run flows.  Its default name is "data-hub-role"  An administrator can set up a system such that this is the role used for data ingestion and for executing data hub flows.


## Users

Two users are also installed along with DHF.  Similar to roles, the names of these users are configurable at hub install time in gradle.properties.  By default the two users are "hub-admin-user" and "data-hub-user".

The "data-hub-user" ships with the "data-hub-role", under whatever name was configured at runtime.

So that the hub admin can run flows and administer a DHF, it ships with both the "hub-admin-role" AND the "data-hub-role".  A production security model may choose to separate these concerns.

When you configure your application to access DHF, use these two users to develop and test flows, and then to test running them in a production environment.

A third user account is required if you are bootstrapping or installing a DHF from scratch.  Whomever installs DHF must have the privilege to create the DHF roles and users, so a special property in gradle.properties, `mlSecurityUsername` and `mlSecurityPasswrod` is used for the very first step of installation, during which the two roles and users are created.  Subsequent steps in the deployment process use `mlUsername` or `mlManageUsername`.




