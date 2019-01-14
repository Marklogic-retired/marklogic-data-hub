To create an input flow for the `{{ include.entityname }}` entity,

{% assign pref="qs-4x-flows-create-complete" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="" class="screenshot" %}

1. In QuickStart's navigation bar, click **Flows**{:.uimenuitem}.
1. {% assign full-text = "Expand **" | append: include.entityname | append: "**{:.uilabel} in the left panel." %}{{ full-text }}
1. Click the **+**{:.uilabel} for **Input Flows**{:.uilabel}.
1. {% assign full-text = "In the **Create Input Flow**{:.uilabel} dialog, set **Input Flow Name**{:.uilabel} to <code>Load " | append: include.entityname | append: "s</code>." %}{{ full-text }}
1. Click **CREATE**{:.inline-button}.
{:.ol-steps}