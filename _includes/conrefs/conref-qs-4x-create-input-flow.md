{% if include.fullsteps %}
To create an input flow for the `{{ include.entityname }}` entity,

{% assign pref="qs-4x-flows-create-complete" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Create Input Flow form" imgclass="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Flows**{:.uimenuitem}.{% endif %}
1. {% assign full-text = "Expand **" | append: include.entityname | append: "**{:.uilabel} in the left panel." %}{{ full-text }}
1. Click the **+**{:.uilabel} for **Input Flows**{:.uilabel}.
1. {% assign full-text = "In the **Create Input Flow**{:.uilabel} dialog, set **Input Flow Name**{:.uilabel} to <code>" | append: include.inputflowname | append: "</code>." %}{{ full-text }}
1. Click **CREATE**{:.inline-button}.
{:.ol-steps}