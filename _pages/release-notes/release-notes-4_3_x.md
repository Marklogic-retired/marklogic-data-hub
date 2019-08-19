# Release Notes for DHF 4.3.2

<details open><summary class="relnote-summary">Base URI Required for Entities</summary>
  <div markdown="1">

  In previous versions, the base URI property of entities was optional, as it still is in Entity Services.

  Now, Data Hub validates the base URI property of entities and makes the property required. It must be in the format `http://example.org`.

  To add the base URI property to existing entity definitions,

  - you can edit the entity in QuickStart, or
  - you can manually edit the entity definition file in `your-project-root/entities` to add the `baseUri` property.
    ```
    {
      "info" : {
        "title" : "MyEntity",
        "version" : "0.0.1",
        "baseUri" : "http://example.org"
      },
      "definitions" : {
        ...
      }
    }
    ```

  *Important:* If your application uses multiple entity definitions, you must provide a valid base URI in every entity definition used. Otherwise, deploying your application will fail when the entity definitions are loaded into MarkLogic.

  *Tip:* Use the same base URI for related entities.

  </div>
</details>

<details open><summary class="relnote-summary">Compliance with Entity Services Format</summary>
  <div markdown="1">

  Manually created or modified entity definitions must now comply with the required format as defined in the Entity Services documentation, except that Base URI is required by Data Hub.

  </div>
</details>

<details open><summary class="relnote-summary">Requires MarkLogic Server 9.0-7</summary>
  <div markdown="1">

  Data Hub Framework 4.3.2 requires MarkLogic Server 9.0-7 up to the latest 9.x version.

  **NOTE:** Data Hub Framework 4.3.2 is not compatible with MarkLogic Server 10.x. If you prefer to use MarkLogic Server 10.x, you must upgrade to [Data Hub 5.x](https://docs.marklogic.com/datahub/upgrade.html).

  </div>
</details>

<details open><summary class="relnote-summary">Improvements</summary>
  <div markdown="1">

  - Made necessary changes in 4.3.2 to make it work with 9.0-10+ ML server.
  - Upgraded to ml-gradle 3.16.0.
  - Upgraded to Java API Client 4.2.0.

  </div>
</details>



# Release Notes for DHF 4.3.1

Bug fixes.



# Release Notes for DHF 4.3.0

<details><summary class="relnote-summary">Added Support for XQuery Namespaces</summary>
  <div markdown="1">
  To align better with Entity Services, DHF now supports XQuery namespaces. For more information on namespaces, see [Understanding XML Namespaces in XQuery](https://docs.marklogic.com/guide/xquery/namespaces).
  </div>
</details>

<details><summary class="relnote-summary">Replaced Security Roles</summary>
  <div markdown="1">

  For easier integration with other MarkLogic services, DHF 4.3 uses new security roles.

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
