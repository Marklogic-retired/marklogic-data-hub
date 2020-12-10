<div id="DHF403401to410" class="tabcontent" markdown="1">

The notes and steps in this tab are for the following upgrade paths:
- DHF 4.0.3 » 4.1.x or 4.2.x
- DHF 4.0.2 » 4.1.x or 4.2.x
- DHF 4.0.1 » 4.1.x or 4.2.x


### Upgrade Notes

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

1. {% include_relative conref-build-gradle-ver.md ver=site.data.global.hub_version_41x %}

1. {% include ostabs-run-gradle-step.html grtask="hubUpdate -i" %}

1. Edit your `gradle.properties` file, and add the following property.

      ```
      mlDHFVersion=4.1.0
      ```

1. In `your-project-root/src/main`, copy any custom database/server configurations from the archived configuration files to the new ones. (*4.0.x* is the old DHF version.)

    | copy from files in | paste to files in |
    |---|---|
    | `hub-internal-config-4.0.x` | `hub-internal-config` |
    | `ml-config-4.0.x` | `ml-config` |
    {:.table-b1gray}

1. {% include ostabs-run-gradle-step.html grtask="mlDeploy" %}

1. Run your [ingest]({{site.baseurl}}/ingest/) and [harmonize]({{site.baseurl}}/harmonize/) flows.
{:.ol-steps}
</div>
