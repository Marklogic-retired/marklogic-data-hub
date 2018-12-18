<div id="DHF403401to410" class="tabcontent" markdown="1">

The notes and steps in this tab are for the following upgrade paths:
- DHF 4.0.3 » 4.1.0
- DHF 4.0.2 » 4.1.0
- DHF 4.0.1 » 4.1.0


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


### Steps

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

      <!-- See build script. -->

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
