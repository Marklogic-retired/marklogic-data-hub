---
layout: inner
title: Security
permalink: /refs/security/
redirect_from: "/docs/security/"
---

# Security

## Overview

MarkLogic implements a role-based security model, which is described in-depth in the
[Security Guide](https://docs.marklogic.com/guide/security)

In a role-based security model, roles are used to define a set of permissions or privileges, which can also be inherited from other roles. For example, a role might allow reading but not modifying specific information in the database.

A user who is assigned one or more roles is granted the union of the permissions in those roles.

Pieces of information in a record can also be restricted further. For example, access to personally identifiable information (PII), such as addresses and credit card numbers, can be more restricted than access to other information in the same record. PII data is visible only to users with the `pii-reader` role. For more information on managing PII in DHF, see [Managing Personally Identifiable Information]({{site.baseurl}}/govern/pii/).


## Security Roles and Users

<!-- Tab links -->
<div class="tab">
  <button class="tablinks" onclick="openTab(event, 'DHF430')" id="defaultOpen">DHF 4.3.0 and later</button>
  <button class="tablinks" onclick="openTab(event, 'DHF42x')">DHF 4.2.2 and earlier</button>
</div>


<!-- Tab content -->

<div id="DHF430" class="tabcontent" markdown="1">

### In DHF 4.3.0 and Later Versions

In DHF 4.3.0 and later versions, four security roles are used.

<table class="table-b1gray">
  <tr>
    <th>New Role<br>(DHF 4.3.0 and later)</th>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Database Admin</td>
    <td></td>
    <td><ul>
      <li>Manages MarkLogic Server resources and performs infrastructure-related tasks.</li>
      <li>Assigns users to the Security Admin role, but not to other roles.</li>
      <li>Must be assigned as part of the first deployment (i.e., bootstrapping role).</li></ul></td>
  </tr>
  <tr>
    <td>Security Admin</td>
    <td></td>
    <td><ul>
      <li>Assigns users to various roles. (including the Security Admin role?)</li>
      <li>Creates new roles.</li></ul></td>
  </tr>
  <tr>
    <td>Flow Developer</td>
    <td></td>
    <td><ul>
      <li>Installs DHF into the MarkLogic Server.</li>
      <li>Creates/Updates and uploads flows to the modules database.</li>
      <li>Deploys apps.</li>
      <li>Publishes the flows to production.</li>
      <li>Configures the indexes and TDEs, and publishes them to modules. (?)</li></ul>
      (Same role as in Data Hub Service.)</td>
  </tr>
  <tr>
    <td>Flow Operator</td>
    <td></td>
    <td><ul>
      <li>Loads and modifies data in the staging database and the final database.</li>
      <li>Executes flows (e.g. via ml-gradle).</li>
      <li>Monitors activity in the traces/jobs logs.</li></ul>
      (Same role as in Data Hub Service.)</td>
  </tr>
</table>

</div>


<div id="DHF42x" class="tabcontent" markdown="1">

### In DHF 4.2.2 and Earlier Versions

You might use DHF in two typical environments:

  - During development

      - Typically on a local machine.
      - Frequent iterations of development (creating and modifying mappings and flows), testing, and re-deploying.
      - The user account requires more privileges than operators and end-users.

  - In production

      - Typically on a production environment.
      - All code and settings are already deployed to the production server.
      - The user account only needs to be able to write documents and to evaluate data across databases. It does NOT need to deploy modules or reconfigure MarkLogic.

{% include note.html type="NOTE" content="You can customize the names of roles and users in the `gradle.properties` file during DHF installation." %}
<!-- Exactly when? -->

DHF 4.2.2 and earlier versions provide the following default roles in your project:

  | Default names | Description | When used |
  |---|---|---|
  | `hub-admin-role` | Does not have administrative access to the entire MarkLogic server, but has enough to deploy and undeploy code from a data hub. NOTE: When the data hub is initially installed, this role is overridden by the value of the `mlHubAdminUserRole` property in `gradle.properties`, if set. | During development |
  | `data-hub-role` | Can be used for data ingestion and for flow execution in the data hub. | In a production environment |
  {:.table-b1gray}

The following default users are also provided:

  | Default names | Default assigned roles | Purpose |
  |---|---|---|
  | `hub-admin-user` | `hub-admin-role` and `data-hub-role` | To administer a data hub and to run flows. |
  | `data-hub-user` | `data-hub-role` | To run flows. |
  {:.table-b1gray}

The `hub-admin-user` is assigned both roles by default because that user needs to run flows and administer a data hub; however, you can remove the `data-hub-role` in your production environment for improved security.


When installing DHF, you need a MarkLogic Server security admin account with sufficient privileges to create these roles and users. You can specify the username and password of this security admin account in the `mlSecurityUsername` and `mlSecurityPassword` properties in the `gradle.properties` file.

Subsequent steps in the deployment process use the account you specify in `mlUsername` or `mlManageUsername`.

</div>
