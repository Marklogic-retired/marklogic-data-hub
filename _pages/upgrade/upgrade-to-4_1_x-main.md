# Upgrade to DHF 4.1.x

## Prerequisites

Data Hub Framework 4.1.0 requires the following software:

- MarkLogic Server 9.0-5 or later

  - {% include_relative conref-note-div-mlserver.md %}

  - {% include_relative conref-note-dhs-reqs.md %}

- Oracle Java 8 JRE

- For the QuickStart tool: A modern browser, such as Chrome or Firefox

{% include_relative conref-tip-backup.md %}


## Upgrade Notes and Steps

<!-- Tab links -->
<div class="tab">
  <button class="tablinks" onclick="openTab(event, 'DHF403401to410')" id="defaultOpen">From 4.0.1+</button>
  <button class="tablinks" onclick="openTab(event, 'DHF400to410')">From 4.0.0</button>
  <button class="tablinks" onclick="openTab(event, 'DHF300204to410')">From 3.0.0 or 2.0.4+</button>
  <button class="tablinks" onclick="openTab(event, 'DHFpre204to410')">From earlier versions</button>
</div>
<!-- Tab content -->
{% include_relative upgrade-to-4_1_x-tab-DHF403401to410.md %}
{% include_relative upgrade-to-4_1_x-tab-DHF400to410.md %}
{% include_relative upgrade-to-4_1_x-tab-DHF300204to410.md %}
{% include_relative upgrade-to-4_1_x-tab-DHFpre204to410.md %}


## See Also
- [Release Notes for DHF 4.1.0]({{site.baseurl}}/release-notes/release-notes-4_1_x/)
- [Download DHF 4.1.0.](https://github.com/marklogic/marklogic-data-hub/releases/tag/4.1.0)
