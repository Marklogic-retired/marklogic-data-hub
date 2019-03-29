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

To replace the security roles,
1. Delete the old roles from a remote installation of MarkLogic Server. (DHF will delete the old roles from a local installation of the MarkLogic Server.)
1. Edit your `gradle.properties` file as follows:
  - Delete the following properties:
      ???
  - Replace the values of the following properties:
      ???
  - Add the following properties:
      ???
1. Run the Gradle task `hubInstallModules`.
1. If your custom code refers to the old roles, change them to refer to the new roles.


<!-- Tab links -->
<!--
<div class="tab">
  <button class="tablinks" onclick="openTab(event, 'DHF401422to430')" id="defaultOpen">From 4.0.1, 4.1.x, 4.2.x</button>
  <button class="tablinks" onclick="openTab(event, 'DHF400to430')">From 4.0.0</button>
  <button class="tablinks" onclick="openTab(event, 'DHF300204to430')">From 3.0.0 or 2.0.4+</button>
  <button class="tablinks" onclick="openTab(event, 'DHFpre204to430')">From earlier versions</button>
</div>
-->
<!-- Tab content -->
<!--
{  % include_relative upgrade-to-4_3_x-tab-DHF403401to430.md      }
{  % include_relative upgrade-to-4_3_x-tab-DHF400to430.md %    }
{  % include_relative upgrade-to-4_3_x-tab-DHF300204to430.md %    }
{  % include_relative upgrade-to-4_3_x-tab-DHFpre204to430.md %    }
-->


## See Also
- [Release Notes for DHF 4.3.0]({{site.baseurl}}/release-notes/release-notes-4_3_x/)
- [Download DHF 4.3.0.](https://github.com/marklogic/marklogic-data-hub/releases/tag/4.3.0)
