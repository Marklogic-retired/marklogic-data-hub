# Release Notes for DHF 4.3.x


<details open><summary class="relnote-summary">Added Support for XQuery Namespaces</summary>
  <div markdown="1">
  To align better with Entity Services, DHF now supports XQuery namespaces. For more information on namespaces, see [Understanding XML Namespaces in XQuery](https://docs.marklogic.com/guide/xquery/namespaces).
  </div>
</details>


<details open><summary class="relnote-summary">Replaced Security Roles</summary>
  <div markdown="1">

  For easier integration with other MarkLogic services, DHF 4.3.0 uses new security roles.

  The old security roles `hub-admin-role` and `data-hub-role` are now replaced with the following new roles:

  - Data Hub Admin (`data-hub-admin`)
  - Flow Developer (`flow-developer`)
  - Flow Operator (`flow-operator`)

  For more information on these roles, see [Security Roles]({{site.baseurl}}/refs/security/).

  To update your data hub to use these new roles, see [Upgrading to DHF 4.3.x]({{site.baseurl}}/upgrade/upgrade-to-4_3_x/).

  </div>
</details>


<!--
<details open><summary class="relnote-summary"></summary>
  <div markdown="1">
  </div>
</details>
-->