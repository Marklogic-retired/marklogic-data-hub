{% if include.fullsteps %}
To create an mapping named `{{ include.mappingname }}`,

{% assign pref="qs-4x-mappings-create-complete" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% else %}{% assign suf="" %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext=include.mappingname imgclass="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Mapping**{:.uimenuitem}.{% endif %}
1. In the left panel, click the **+**{:.uilabel} icon for the **{{ include.entityname }}**{:.uilabel} entity.
1. {% assign full-text = "In the **Create New Mapping**{:.uilabel} form, set **Mapping Name**{:.uilabel} to <code>" | append: include.mappingname | append: "</code>." %}{{ full-text }}
1. Click **CREATE**{:.inline-button}.
{:.ol-steps}
{% if include.fullsteps %}

Your new mapping (**{{ include.mappingname }}**{:.uilabel}) appears under **{{ include.entityname }}**{:.uilabel} in the left panel.

The mapping editor displays a row for each property in your entity model. In each row,
- the right column displays the entity property, and
- the left column contains a dropdown list from which you can select the source field that corresponds to that entity property.
{% endif %}

{% if include.fullsteps %}
To configure the mapping,

{% assign pref="qs-4x-mappings-editor" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% else %}{% assign suf="" %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Mapping editor" imgclass="screenshot" tab="  " %}{% endif %}

1. For each entity property, expand the dropdown list under **Source**{:.uilabel} and select the source field that corresponds to that entity property.

      {% include note-in-list.html type="TIP" content="You can enter part of the field name to filter the dropdown list." %}

1. Click **SAVE MAPPING**{:.inline-button}.
{:.ol-steps}


{% if include.diffsource %}
QuickStart selects one of the items ingested into the STAGING database.
  - The URI of that selected item is displayed at the top of the **Source**{:.uilabel} column of the mapping editor.
  - The fields of that item are presented in the dropdown lists.

To choose a different source item to map to your entity model,

1. Get the URI of a different source item.
  1. In QuickStart's navigation bar, click **Browse Data**{:.uimenuitem}.
  1. Select the `STAGING` database if not already selected.
  1. Narrow the list by clicking on the **{{ include.entityname }}**{:.uilabel} collection among the filters on the left.
  1. Select an item and click its copy icon **<i class='fa fa-copy'></i>**{:.inline-button} to copy its URI to your clipboard.
  {:.ol-substeps}
1. Replace the selected item in the mapping editor.
  1. In QuickStart's navigation bar, click **Mapping**{:.uimenuitem}.
  1. In the left panel, click the mapping you just created (**{{ include.entityname }} Mapping**{:.uilabel}).
  1. In the mapping editor under **Source**{:.uilabel}, click the pencil icon **<i class='fa fa-pencil-alt'></i>**{:.inline-button} next to the **URI**{:.uilabel}.
  {:.ol-substeps}
{:.ol-steps}
{% endif %}