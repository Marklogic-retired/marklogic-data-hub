{% if include.entityname %}
  {%- assign theentity="the <span class='uilabel'>" | append: include.entityname | append: "</span> entity" -%}
  {%- assign entitytab="the tab named <span class='uilabel'>" | append: include.entityname | append: "</span>" -%}
  {%- assign suf="-" | append: include.entityname -%}
{% else %}
  {%- assign theentity="your entity" -%}
  {%- assign entitytab="the tab with your entity name" -%}
  {%- assign suf="" -%}
{% endif %}

{% if include.mappingname %}
  {%- assign themapping="a mapping named `" | append: include.mappingname | append: "`" -%}
  {%- assign mappingcreated="**"| append: include.mappingname | append: "**" | append: ", if any" -%}
{% else %}
  {%- assign themapping="your mapping" -%}
  {%- assign mappingcreated="the mapping you created, if any" -%}
{% endif %}

{% if include.harmonizeflowname %}
  {%- assign theflowname="<code>" | append: include.harmonizeflowname | append: "</code>" -%}
{% else %}
  {%- assign theflowname="the name you choose for your harmonization flow" -%}
{% endif %}


{% if include.create %}
{% if include.fullsteps %}
To create a harmonization flow for {{ theentity }},

{% assign full-imgpath=include.imgpath | append: "qs-4x-flows-create-harmonize-flow" | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Create Harmonize Flow form" imgclass="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Flows**{:.uimenuitem}.{% endif %}
1. {% assign full-text = "Expand " | append: entitytab | append: " in the left panel." %}{{ full-text }}
1. Click the **+**{:.uilabel} for **Harmonize Flows**{:.uilabel}.
1. {% assign full-text = "In the **Create Harmonize Flow**{:.uilabel} dialog, set **Harmonize Flow Name**{:.uilabel} to " | append: theflowname | append: "." %}{{ full-text }}
{% if include.mappingname %}1. Under **Mapping Generation**{:.uilabel}, check " | append: mappingcreated | append: " ".{% endif %}
1. Click **CREATE**{:.inline-button}.
{:.ol-steps}
{% endif %}

{% if include.run %}
{% if include.fullsteps %} When you create a flow with mapping, QuickStart automatically generates harmonization code based on the entity model and the mapping and then deploys the code to MarkLogic Server.

To run the harmonization flow,{% endif %}

{% assign full-imgpath=include.imgpath | append: "qs-4x-flows-run-harmonize-flow" | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Run Flow form" imgclass="screenshot" tab="  " %}

1. Click the **Flow Info**{:.uilabel} tab.
1. Click **Run Harmonize**{:.inline-button}.
{:.ol-steps}
{% endif %}