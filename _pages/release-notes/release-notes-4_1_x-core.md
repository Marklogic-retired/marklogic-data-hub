# Release Notes for DHF 4.1.0

<details open><summary class="relnote-summary">The DHF project now aligns more closely with standard ml-gradle applications.</summary>
  <div markdown="1">

  - The directory structure and locations of configuration files remain the same as in DHF 4.0.x.

  - See [Project Directory Structure]({{site.baseurl}}/refs/project-structure/) for information on the `ml-config` and `hub-internal-config` directories.

  - See [Gradle tasks]({{site.baseurl}}/refs/gradle-tasks/) for information about ml-gradle tasks specific to DHF.

  - Java deployment commands specific to the data hub were changed as follows:

      - Added:
        - `DeployHubOtherServersCommand.java`
        - `HubDeployDatabaseCommandFactory.java`
        - `LoadHubSchemasCommand.java`

      - Renamed:
        - from `LoadUserStagingModulesCommand.java` to `LoadUserModulesCommand.java`

      - Removed:
        - `DeployHubDatabasesCommand.java`
        - `DeployHubFinalSchemasDatabaseCommand.java`
        - `DeployHubFinalTriggersDatabaseCommand.java`
        - `DeployHubOtherDatabasesCommand.java`
        - `DeployHubRolesCommand.java`
        - `DeployHubSchemasDatabaseCommand.java`
        - `DeployHubServersCommand.java`
        - `DeployHubStagingSchemasDatabaseCommand.java`
        - `DeployHubStagingTriggersDatabaseCommand.java`
        - `DeployHubTriggersDatabaseCommand.java`
        - `DeployHubUsersCommand.java`
        - `DeployUserRolesCommand.java`
        - `DeployUserServersCommand.java`
        - `DeployUserUsersCommand.java`

  - Custom triggers must now be added to `ml-config/databases/(database name)/triggers`. (In previous releases, triggers were added to `hub-internal-config/triggers` or `ml-config/triggers`.) See [ml-grade Project Layout](https://github.com/marklogic-community/ml-gradle/wiki/Project-layout#database-specific-resources) for more information on triggers.
  </div>
</details>


<details open><summary class="relnote-summary">DHF Java API changed to allow DHF to use the Spring Framework.</summary>
  <div markdown="1">
  - The Java `HubConfig` class now has a singleton scope.
  - See [DHF Java Library](https://marklogic.github.io/marklogic-data-hub/javadocs/4.1.0/) for more information.
  </div>
</details>


<!--
<details open><summary class="relnote-summary">...</summary>
  <div markdown="1">
  ...
  </div>
</details>
-->

<!--
## Changes and Incompatibilities

### DHF 4.1.0 Changes and Incompatibilities
-->

<!--
<details><summary>...</summary>
  <div markdown="1">
  ...
  </div>
</details>
-->
