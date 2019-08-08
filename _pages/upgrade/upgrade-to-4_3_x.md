<!--
layout: inner
title: Upgrade to DHF 4.3.x
permalink: /upgrade/upgrade-to-4_3_x/
-->

# Upgrade to DHF 4.3

## Prerequisites

Data Hub Framework 4.3 requires the following software:

- MarkLogic Server:

  - For DHF 4.3.2, [MarkLogic Server 9.0-7 up to the latest 9.x version](http://developer.marklogic.com/products/marklogic-server/9.0). [(See the version compatibility page for other DHF versions.)]({{site.baseurl}}/refs/version-compatibility/)

  - {% include_relative conref-note-div-mlserver.md %}

  - {% include_relative conref-note-div-mlserver10-dh5.md %}

  - {% include_relative conref-note-dhs-reqs.md %}

- Oracle Java 8 JRE

- For the QuickStart tool: A modern browser, such as Chrome or Firefox

{% include_relative conref-tip-backup.md %}


## Upgrade Notes and Procedure

### Upgrade Notes for DHF 4.3

The following security roles changed in DHF 4.3.

  | old roles      | old default users | new roles           | new default users |
  |---|---|---|---|
  | hub-admin-role | hub-admin-user    | data-hub-admin-role | (no default)      |
  |                |                   | flow-developer-role | flow-developer    |
  | data-hub-role  | data-hub-user     | flow-operator-role  | flow-operator     |
  {:.table-b1gray}

You can use your old custom users instead of the new default users. Remember to assign them to the new roles.

{% include note.html type="NOTE" content="If you are deploying to the Data Hub Service on the cloud, note that the new `flow-developer-role` role in DHF is the equivalent of the `flowDeveloper` role in DHS. You must create a user in DHS to assign to the `flowDeveloper` role and add that user's credentials to the `gradle.properties` file you use for DHS (e.g., `gradle-DHS.properties`)." %}

For more information on roles in DHF, see [Security]({{site.baseurl}}/refs/security/).


<!-- Tab links -->
<div class="tab">
  <button class="tablinks" onclick="openTab(event, 'DHF42x41xto43x')" id="defaultOpen">From 4.2.x or 4.1.x</button>
  <button class="tablinks" onclick="openTab(event, 'DHF403401to43x')">From 4.0.1+</button>
  <button class="tablinks" onclick="openTab(event, 'DHF400to43x')">From 4.0.0</button>
  <button class="tablinks" onclick="openTab(event, 'DHF300204to43x')">From 3.0.0 or 2.0.4+</button>
  <button class="tablinks" onclick="openTab(event, 'DHFpre204to43x')">From earlier versions</button>
</div>
<!-- Tab content -->
{% include_relative upgrade-to-4_3_x-tab-DHF42x41x.md %}
{% include_relative upgrade-to-4_3_x-tab-DHF403401.md %}
{% include_relative upgrade-to-4_3_x-tab-DHF400.md %}
{% include_relative upgrade-to-4_3_x-tab-DHF300204.md %}
{% include_relative upgrade-to-4_3_x-tab-DHFpre204.md %}


## See Also
- [Release Notes for DHF 4.3.x]({{site.baseurl}}/release-notes/release-notes-4_3_x/)
- [Download DHF 4.3.2.](https://github.com/marklogic/marklogic-data-hub/releases/tag/v4.3.2)
- [Version Compatibility]({{site.baseurl}}/refs/version-compatibility/)