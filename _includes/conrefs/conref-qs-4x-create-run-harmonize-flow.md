{% if include.create %}
{% if include.fullsteps %}
To create a harmonization flow for the `{{ include.entityname }}` entity,

{% assign pref="qs-4x-flows-create-harmonize-flow" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% else %}{% assign suf="" %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Create Harmonize Flow form" imgclass="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Flows**{:.uimenuitem}.{% endif %}
1. {% assign full-text = "Expand **" | append: include.entityname | append: "**{:.uilabel} in the left panel." %}{{ full-text }}
1. Click the **+**{:.uilabel} for **Harmonize Flows**{:.uilabel}.
1. {% assign full-text = "In the **Create Harmonize Flow**{:.uilabel} dialog, set **Harmonize Flow Name**{:.uilabel} to <code>" | append: include.harmonizeflowname | append: "</code>." %}{{ full-text }}
{% if include.mappingname %}1. Under **Mapping Generation**{:.uilabel}, check **{{ include.mappingname }}** .{% endif %}
1. Click **CREATE**{:.inline-button}.
{:.ol-steps}
{% endif %}

{% if include.run %}
{% if include.fullsteps %} When you create a flow with mapping, QuickStart automatically generates harmonization code based on the entity model and the mapping and then deploys the code to MarkLogic Server.

To run the harmonization flow,{% endif %}

{% assign pref="qs-4x-flows-run-harmonize-flow" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% else %}{% assign suf="" %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Run Flow form" imgclass="screenshot" tab="  " %}

1. Click the **Flow Info**{:.uilabel} tab.
1. Click **Run Harmonize**{:.inline-button}.
{:.ol-steps}
{% endif %}