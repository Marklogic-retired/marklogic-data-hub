# Release Notes for DHF 4.2.0

<details open><summary class="relnote-summary">Data Hub Framework 4.2 is now more aligned with Entity Services.</summary>
  <div markdown="1">

  The alignment with Entity Services provides the following benefits:

  - Improved compatibility between Data Hub and Entity Services regarding nested entities and 1-to-many relationships among entities.

  - Automatic generation and installation of a template-driven extraction (TDE) template in the final SCHEMAS database (`data-hub-final-SCHEMAS`). See [the TDE documentation](http://docs.marklogic.com/guide/app-dev/TDE).

  *[View a demo of the TDE template generation. (video)]({{site.baseurl}}/videos/TDE_template_video.mp4){:target="_blank"}*
  </div>
</details>


<details open><summary class="relnote-summary">ml-gradle is upgraded and a new task added.</summary>
  <div markdown="1">

  - ml-gradle in DHF has been upgraded to version 3.12.

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
