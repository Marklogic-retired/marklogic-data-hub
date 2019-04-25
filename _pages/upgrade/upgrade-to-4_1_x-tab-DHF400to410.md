<div id="DHF400to410" class="tabcontent" markdown="1">

The notes and steps in this tab are for the following upgrade paths:
- DHF 4.0.0 » 4.1.x or 4.2.x


### Upgrade Notes

- DHF 4.0.0 is unique among DHF versions because it has two modules databases: one for the final app server/database and one for the staging app server/database. All other DHF versions before and after 4.0.0 have only one modules database. When upgrading to 4.1.0, those databases must be commented out in `gradle.properties`.

- The `hubUpdate` task makes the following changes.

    - Archives existing configuration directories under `your-project-root/src/main`.

      | old directory | new archive directory |
      |---|---|
      | `hub-internal-config` | `hub-internal-config-4.0.0` |
      | `ml-config` | `ml-config-4.0.0` |
      {:.table-b1gray}

    - Overwrites the existing databases, server directories, and the security directory.

- {% include conrefs/conref-remark-hubupdate-verbose.md %}


### Procedure

1. {% include_relative conref-build-gradle-ver.md ver=site.data.global.hub_version_41x %}

1. {% include ostabs-run-gradle-step.html grtask="hubUpdate -i" %}

1. In `your-project-root/src/main`, copy any custom database/server configurations from the archived configuration files to the new ones.

    | copy from files in | paste to files in |
    |---|---|
    | `hub-internal-config-4.0.0` | `hub-internal-config` |
    | `ml-config-4.0.0` | `ml-config` |
    {:.table-b1gray}

    {% include note-in-list.html type="IMPORTANT" content="Do **NOT** copy any references to the staging(`%%mlStagingModulesDbName%%`) and final(`%%mlFinalModulesDbName%%`) modules databases. These settings are replaced in DHF 4.1.x with `%%mlModulesDbName%%`." %}

1. Edit your `gradle.properties` file.

    a. Remove the following properties: <!-- What are the actual names? -->

      ```
      mlStagingModulesDbName
      mlStagingModulesForestsPerHost
      mlStagingModulePermissions
      mlFinalModulesDbName
      mlFinalModulesForestsPerHost
      mlFinalModulePermissions
      ```

    b. Add the following properties and replace the values accordingly.

      ```
      mlDHFVersion=4.1.0
      mlModulesDbName=data-hub-MODULES
      mlModulesForestsPerHost=1
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

After running `mlUndeploy`, delete the following obsolete resources:
- data-hub-staging-MODULES database and forest
- data-hub-final-MODULES database and forest
</div>
