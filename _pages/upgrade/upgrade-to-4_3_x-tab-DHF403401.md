<div id="DHF403401to43x" class="tabcontent" markdown="1">

The notes and steps in this tab are for the following upgrade paths:
- DHF 4.0.3 » 4.3.x
- DHF 4.0.2 » 4.3.x
- DHF 4.0.1 » 4.3.x


### Additional Upgrade Notes

- The `hubUpdate` task makes the following changes.

    - Archives existing configuration directories under `your-project-root/src/main`. (*4.0.x* is the old DHF version.)

      | old directory | new archive directory |
      |---|---|
      | `hub-internal-config` | `hub-internal-config-4.0.x` |
      | `ml-config` | `ml-config-4.0.x` |
      {:.table-b1gray}

    - Overwrites the existing databases, server directories, and the security directory.

- {% include conrefs/conref-remark-hubupdate-verbose.md %}


### Procedure

1. {% include_relative conref-build-gradle-ver.md ver=site.data.global.hub_version_43x %}

1. {% include ostabs-run-gradle-step.html grtask="hubUpdate -i" %}

      **Result:** A `gradle-GENERATED.properties` file is created.

1. Update your `gradle.properties` file based on the `gradle-GENERATED.properties` file.

    {% include note-in-list.html type="IMPORTANT" content="Do NOT update `mlUsername` or `mlPassword` yet, and do NOT delete the old `mlHubUser*` and `mlHubAdmin*` properties yet. You need the old user accounts to access MarkLogic Server in the `mlDeploy` task." %}

    a. Add the following properties and replace the values accordingly.

      ```
      mlDHFVersion={{ site.data.global.hub_version_43x }}
      ...
      mlFlowOperatorRole=flow-operator-role
      mlFlowOperatorUserName=flow-operator
      mlFlowOperatorPassword=your-flow-operator-password
      ...
      mlFlowDeveloperRole=flow-developer-role
      mlFlowDeveloperUserName=flow-developer
      mlFlowDeveloperPassword=your-flow-developer-password
      ...
      mlDataHubAdminRole=data-hub-admin-role
      ```

    b. Assign default module permissions to the new roles.

      ```
      mlModulePermissions=rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute,flow-developer-role,read,flow-developer-role,execute,flow-developer-role,insert,flow-operator-role,read,flow-operator-role,execute
      ```

1. If your custom code refers to the old roles/users, change them to refer to the new roles/users.

1. In `your-project-root/src/main`, copy any custom database/server configurations from the archived configuration files to the new ones. (*4.0.x* is the old DHF version.)

    | copy from files in | paste to files in |
    |---|---|
    | `hub-internal-config-4.0.x` | `hub-internal-config` |
    | `ml-config-4.0.x` | `ml-config` |
    {:.table-b1gray}

1. {% include ostabs-run-gradle-step.html grtask="mlDeploy" %}

1. Edit your `gradle.properties` file again.

    a. Update `mlUsername` or `mlPassword` with a new user assigned to `flow-developer-role` (to create and deploy flows) or to `flow-operator-role` (to run flows).

      ```
      mlUsername=flow-operator
      mlPassword=your-flow-operator-password
      ```

    b. Remove the following properties.

      - mlHubUserRole
      - mlHubUserName
      - mlHubUserPassword
      - mlHubAdminRole
      - mlHubAdminUserName
      - mlHubAdminUserPassword

1. (Optional) Delete the old roles from MarkLogic Server.

      - hub-admin-role
      - data-hub-role

1. Run your [ingest]({{site.baseurl}}/ingest/) and [harmonize]({{site.baseurl}}/harmonize/) flows.

    If you use [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp) for your input flows, run MLCP with the `-transform_module` option as follows:
      {% include tabs2.html
        tab1title="XQuery plugin (.xqy)"
        tab1content="-transform_module \"/data-hub/4/transforms/mlcp-flow-transform.xqy\""
        tab2title="JavaScript plugin (.sjs)"
        tab2content="-transform_module \"/data-hub/4/transforms/mlcp-flow-transform.sjs\""
      %}
{:.ol-steps}
</div>
