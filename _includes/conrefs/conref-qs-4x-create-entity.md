{% if include.entityname %}
  {%- assign theentity="an entity named <span class='uilabel'>" | append: include.entityname | append: "</span>" -%}
  {%- assign entitytitle="<code>" | append: include.entityname | append: "</code>" -%}
  {%- assign suf="-" | append: include.entityname -%}
{% else %}
  {%- assign theentity="your entity" -%}
  {%- assign entitytitle="the name you choose for your entity" -%}
  {%- assign suf="" -%}
{% endif %}


{% if include.fullsteps %}
To create {{ theentity }},

{%- assign full-imgpath=include.imgpath | append: "qs-4x-entities-create-complete" | append: suf | append: ".png" -%}
{% include thumbnail.html imgfile=full-imgpath alttext="New Entities form" imgclass="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Entities**{:.uimenuitem}.
1. Click the wrench icon **<i class='fa fa-wrench'></i>**{:.circle-button} to open the entity tools control.{% endif %}
1. Click **+ New Entity**{:.inline-button}.
1. {% assign full-text = "In the **New Entity**{:.uilabel} form, set **Title**{:.uilabel} to " | append: entitytitle | append: "." %}{{ full-text }}
1. Click **Save**{:.inline-button}.
{% if include.fullsteps %}
{%- assign full-imgpath = include.imgpath | append: "qs-4x-update-indexes-no.png" -%}
{%- assign full-text="If prompted to update the index, click <span class='inline-button'>No</span>." -%}
{%- include step-collapsed.html steptext=full-text stepimg=full-imgpath imgclass="img-small" -%}
{% else %}1. If prompted to update the index, click **No**{:.inline-button}.{% endif %}
{:.ol-steps}