# Release Notes for DHF 4.2.0

<details open><summary class="relnote-summary">Data Hub Framework 4.2 is now more aligned with Entity Services.</summary>
  <div markdown="1">

  The alignment with Entity Services provides the following benefits:

  - Improved compatibility between Data Hub and Entity Services regarding nested entities and 1-to-many relationships among entities.

  - Automatic generation and installation of a template-driven extraction (TDE) template in the SCHEMAS database. See [the TDE documentation](http://docs.marklogic.com/guide/app-dev/TDE).

  {% include note.html type="IMPORTANT" content="Entities created in earlier versions are still supported by DHF; however, changes might be required for them to appear without errors in Quickstart. For information on how to restructure your entity, see the <a href='https://docs.marklogic.com/guide/entity-services/models'>Entity Services model documentation</a>." %}

  </div>
</details>


<details open><summary class="relnote-summary">ml-gradle is upgraded and a new task added.</summary>
  <div markdown="1">
  
  - ml-gradle in DHF has been upgraded to version 3.11.

  - The new ml-gradle task `hubDeployUserArtifacts` is added. It installs user artifacts (such as entities and mappings) to the MarkLogic server. See [Gradle Tasks in DHF]({{site.baseurl}}/refs/gradle-tasks/) for the list of tasks you can use.

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

### DHF 4.2.0 Changes and Incompatibilities
-->

<!--
<details><summary>...</summary>
  <div markdown="1">
  ...
  </div>
</details>
-->
