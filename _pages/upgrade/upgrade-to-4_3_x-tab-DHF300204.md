<div id="DHF300204to43x" class="tabcontent" markdown="1">

The notes and steps in this tab are for the following upgrade paths:
- DHF 3.0.0 » 4.3.x
- DHF 2.0.6 » 4.3.x
- DHF 2.0.5 » 4.3.x
- DHF 2.0.4 » 4.3.x


### Additional Upgrade Notes

- The `hubUpdate` Gradle task makes the following changes.

    - Renames old configuration directories under your project root.

      | old directory | new directory |
      |---|---|
      | `hub-internal-config` | `hub-internal-config.old` |
      | `user-config` | `user-config.old` |
      | `entity-config` | `entity-config.old` |
      {:.table-b1gray}

    - Creates the new project directory structure (`your-project-root/src/main` and its subdirectories) and new files.

    - Copies some settings from the old configuration files to the new ones.

    - Updates all flows to use updated imports. See the [notes to upgrade to 4.0.x](https://marklogic.github.io/marklogic-data-hub/upgrade/upgrade-to-4_0_x/#upgrading-from-204-to-40x).

- {% include conrefs/conref-remark-hubupdate-verbose.md %}

- If custom configurations (i.e., from `user-config`) are missing, you must manually copy them to `ml-config`.

- Because DHF 3.0.0 and DHF 2.0.4+ had only a single SCHEMAS database and a single TRIGGERS database, you must decide whether to use those existing databases as the staging databases or as the final databases in DHF 4.x. The settings in `gradle.properties` (and possibly other configurations) depend on your decision.

  | DHF 3.0.0 and 2.0.4+ | DHF 4.x |
  |---|---|
  | `data-hub-SCHEMAS` database | `data-hub-staging-SCHEMAS` database<br>`data-hub-final-SCHEMAS` database |
  | `data-hub-TRIGGERS` database | `data-hub-staging-TRIGGERS` database<br>`data-hub-final-TRIGGERS` database |
  {:.table-b1gray}


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
      ...
      mlStagingTriggersDbName=data-hub-staging-TRIGGERS
      mlStagingTriggersForestsPerHost=1
      mlStagingSchemasDbName=data-hub-staging-SCHEMAS
      mlStagingSchemasForestsPerHost=1
      ...
      mlFinalTriggersDbName=data-hub-final-TRIGGERS
      mlFinalTriggersForestsPerHost=1
      mlFinalSchemasDbName=data-hub-final-SCHEMAS
      mlFinalSchemasForestsPerHost=1
      ```

    b. Assign default module permissions to the new roles.

      ```
      mlModulePermissions=rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute,flow-developer-role,read,flow-developer-role,execute,flow-developer-role,insert,flow-operator-role,read,flow-operator-role,execute
      ```

    c. Remove the following properties. <!-- What are the actual names of the databases? -->

      - data-hub-TRACING server
      - data-hub-TRACING database
      - data-hub-TRIGGERS database
      - data-hub-SCHEMAS database

1. If your custom code refers to the old roles/users, change them to refer to the new roles/users.

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


### Remarks

Before running `mlUndeploy`, delete the resources associated with the properties that were removed from the `gradle.properties` file:

  - data-hub-TRACING server
  - data-hub-TRACING database
  - data-hub-TRIGGERS database
  - data-hub-SCHEMAS database

<!-- To undeploy, "./gradlew mlUndeploy -Pconfirm=true" -->
</div>
