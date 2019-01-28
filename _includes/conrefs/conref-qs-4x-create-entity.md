{% if include.fullsteps %}
To create an entity named `{{ include.entityname }}`,

{% assign pref="qs-4x-entities-create-complete" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% else %}{% assign suf="" %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="New Entities form" imgclass="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Entities**{:.uimenuitem}.
1. Click the wrench icon **<i class='fa fa-wrench'></i>**{:.circle-button} to open the entity tools control.{% endif %}
1. Click **+ New Entity**{:.inline-button}.
1. {% assign full-text = "In the **New Entity**{:.uilabel} form, set **Title**{:.uilabel} to <code>" | append: include.entityname | append: "</code>." %}{{ full-text }}
1. Click **Save**{:.inline-button}.
{% if include.fullsteps %}
{%- assign full-imgpath = include.imgpath | append: "qs-4x-update-indexes-no.png" -%}
{%- assign full-text="If prompted to update the index, click <span class='inline-button'>No</span>." -%}
{%- include step-collapsed.html steptext=full-text stepimg=full-imgpath imgclass="img-small" -%}
{% else %}1. If prompted to update the index, click **No**{:.inline-button}.{% endif %}
{:.ol-steps}