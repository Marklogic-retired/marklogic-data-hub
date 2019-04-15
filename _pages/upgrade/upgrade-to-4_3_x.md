# Upgrade to DHF 4.3.x

## Prerequisites

Data Hub Framework 4.3.x requires the following software:

- MarkLogic Server 9.0-5 or later

  - {% include_relative conref-note-div-mlserver.md %}

  - {% include_relative conref-note-dhs-reqs.md %}

- Oracle Java 8 JRE

- For the QuickStart tool: A modern browser, such as Chrome or Firefox

{% include_relative conref-tip-backup.md %}


## Upgrade Notes and Steps

If your current DHF version is 4.0.0 or earlier, you must first [upgrade to 4.1.1 or 4.2.2]({{site.baseurl}}/upgrade/upgrade-to-4_1_x/) before upgrading to 4.3.


### Upgrade Notes

Security roles changed from 4.2 to 4.3.

  | old roles      | old default users | new roles           | new default users   |
  |---|---|---|---|
  | hub-admin-role | hub-admin-user    | data-hub-admin-role | data-hub-admin-user |
  |                |                   | flow-developer-role | flow-developer      |
  | data-hub-role  | data-hub-user     | flow-operator-role  | flow-operator       |
  {:.table-b1gray}

You can use your old custom users instead of the new default users. Remember to assign them to the new roles.

If you are deploying to the Data Hub Service on the cloud, the new `flow-developer-role` role and `flow-developer` user are required. Otherwise, you can use `data-hub-admin-role` the same way you used the old `hub-admin-role`.

For more information on roles in DHF, see [Security]({{site.baseurl}}/refs/security/).


### Procedure

1. In your `build.gradle` file, replace all occurrences of your old DHF version number with `4.3.0`.

    **Example:** In the `plugins` section and the `dependencies` section,

      ```
      plugins {
          id 'net.saliman.properties' version '1.4.6'
          id 'com.marklogic.ml-data-hub' version '4.3.0'
      }
      ...
      dependencies {
        compile 'com.marklogic:marklogic-data-hub:4.3.0'
        compile 'com.marklogic:marklogic-xcc:9.0.6'
      }
      ```

      <!-- See build script. -->

1. {% include ostabs-run-gradle-step.html grtask="hubUpdate -i" %}

1. Edit your `gradle.properties` file, and update the values of the following properties.

      ```
      mlDHFVersion=4.3.0
      mlUsername=data-hub-admin-user
      mlPassword=your-data-hub-admin-user-password
      mlFlowOperatorUserName=flow-operator
      mlFlowOperatorUserPassword=your-flow-operator-password
      ```

1. If your custom code refers to the old roles, change them to refer to the new roles.

1. (Optional) Delete the old roles from a remote installation of MarkLogic Server. (DHF will delete the old roles from a local installation of the MarkLogic Server.)

      - hub-admin-role
      - data-hub-role

1. {% include ostabs-run-gradle-step.html grtask="mlDeploy" %}
{:.ol-steps}


## See Also
- [Release Notes for DHF 4.3.0]({{site.baseurl}}/release-notes/release-notes-4_3_x/)
- [Download DHF 4.3.0.](https://github.com/marklogic/marklogic-data-hub/releases/tag/4.3.0)
