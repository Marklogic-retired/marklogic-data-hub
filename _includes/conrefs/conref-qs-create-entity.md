To create an entity named `{{ include.entityname }}`,

{% assign pref="qs-4x-entities-create-complete" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="" class="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Entities**{:.uimenuitem}.
1. Click the wrench icon **<i class='fa fa-wrench'></i>**{:.circle-button} to open the entity tools control.
1. Click **+ New Entity**{:.inline-button}.
1. {% assign full-text = "In the **New Entity**{:.uilabel} form, set **Title**{:.uilabel} to <code>" | append: include.entityname | append: "</code>." %}{{ full-text }}
1. Click **Save**{:.inline-button}.
1. If you are prompted to update the index, click **No**{:.uilabel}.
{:.ol-steps}