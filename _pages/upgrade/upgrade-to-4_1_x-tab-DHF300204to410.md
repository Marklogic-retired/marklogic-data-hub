<div id="DHF300204to410" class="tabcontent" markdown="1">

The notes and steps in this tab are for the following upgrade paths:
- DHF 3.0.0 » 4.1.0
- DHF 2.0.6 » 4.1.0
- DHF 2.0.5 » 4.1.0
- DHF 2.0.4 » 4.1.0


### Upgrade Notes

- The `hubUpdate` Gradle task makes the following changes.

    - Renames old configuration directories.

      | old directory | new directory |
      |---|---|
      | `hub-internal-config` | `hub-internal-config.old` |
      | `user-config` | `user-config.old` |
      | `entity-config` | `entity-config.old` |
      {:.table-b1gray}

    - Overwrites the existing databases and server files with the new project directory structure (*root*`/src/main` and its subdirectories) and new files.

    - Copies some settings from the old configuration files to the new ones. <!-- TODO: What are these settings? -->


- {% include conrefs/conref-remark-hubupdate-verbose.md %}


- You might need to update your custom plugins for the flows as follows.

    - Update all flows to use updated imports. See the [notes to upgrade to 4.0.0] ]({{site.baseurl}}https://marklogic.github.io/marklogic-data-hub/upgrade/upgrade-to-4_0_x/#upgrading-from-204-to-40x).

    - If configurations (i.e., from `user-config`) are missing, you must manually copy them to `ml-config`.


- In 4.0.0, the return type for plugins was changed to `objectNode()`. If your custom plugins contains lines that convert a plugin parameter using `.toObject()`, those lines of code must be removed or commented out.

    **Examples:**
        - `content = content.toObject()` in header.sjs under input directory
        - `envelope = envelope.toObject()` in writer.sjs under harmonize directory


### Steps

1. {% include_relative conref-step-backup.md %}

1. In your `build.gradle` file, replace all occurrences of your old DHF version number with `4.1.0`.

    **Example:** In the `plugins` section and the `dependencies` section,

      ```
      plugins {
          id 'net.saliman.properties' versi Dn '1.4.6'
          id 'com.marklogic.ml-data-hub' version '4.1.0'
      }
      ...
      dependencies {
        compile 'com.marklogic:marklogic-data-hub:4.1.0'
        compile 'com.marklogic:marklogic-xcc:9.0.6'
      }
      ```

1. {% include ostabs-run-gradle-step.html grtask="hubUpdate -i" %}

1. Edit your `gradle.properties` file.

    a. Remove the following properties: <!-- What are the actual names? -->

      - data-hub-TRACING server
      - data-hub-TRACING database
      - data-hub-TRIGGERS database
      - data-hub-SCHEMAS database

    b. Add the following properties and replace the values accordingly.

      ```
      mlDHFVersion=4.1.0
      mlStagingTriggersDbName=data-hub-staging-TRIGGERS
      mlStagingTriggersForestsPerHost=1
      mlStagingSchemasDbName=data-hub-staging-SCHEMAS
      mlStagingSchemasForestsPerHost=1
      mlFinalTriggersDbName=data-hub-final-TRIGGERS
      mlFinalTriggersForestsPerHost=1
      mlFinalSchemasDbName=data-hub-final-SCHEMAS
      mlFinalSchemasForestsPerHost=1
      mlHubAdminRole=hub-admin-role
      mlHubAdminUserName=hub-admin-user
      ```

    c. (Optional) Add default modules permissions.

      ```
      mlModulePermissions=rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute,data-hub-role,read,data-hub-role,execute
      ```

1. {% include ostabs-run-gradle-step.html grtask="mlDeploy" %}

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
