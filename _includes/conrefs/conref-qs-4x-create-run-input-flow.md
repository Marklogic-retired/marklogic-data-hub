{% if include.entityname %}
  {%- assign theentity="the <span class='uilabel'>" | append: include.entityname | append: "</span> entity" -%}
  {%- assign entitytab="the tab named <span class='uilabel'>" | append: include.entityname | append: "</span>" -%}
  {%- assign suf="-" | append: include.entityname -%}
{% else %}
  {%- assign theentity="your entity" -%}
  {%- assign entitytab="the tab with your entity name" -%}
  {%- assign suf="" -%}
{% endif %}

{% if include.inputflowname %}
  {%- assign chosenflowname="<code>" | append: include.inputflowname | append: "</code>" -%}
  {%- assign flownamebold="the **" | append: include.inputflowname | append: "** flow" -%}
{% else %}
  {%- assign chosenflowname="the name you choose for your input flow" -%}
  {%- assign flownamebold="your flow" -%}
{% endif %}

{% if include.datadir %}
  {%- assign datadir="the <code>" | append: include.datadir | append: "</code> directory" -%}
{% else %}
  {%- assign datadir="your raw data source directory" -%}
{% endif %}

{%- assign parentnum="" -%}
{% if include.parentnum %}{%- assign parentnum=include.parentnum -%}{% endif %}


### {{parentnum}}1 - Create an input flow for {{ theentity }}.

{% if include.fullsteps %}

{%- assign full-imgpath=include.imgpath | append: "qs-4x-flows-create-input-flow" | append: suf | append: ".png" -%}
{% include thumbnail.html imgfile=full-imgpath alttext="Create Input Flow form" imgclass="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Flows**{:.uimenuitem}.{% endif %}
1. {% assign full-text = "Expand " | append: entitytab | append: " in the left panel." %}{{ full-text }}
1. Click the **+**{:.uilabel} for **Input Flows**{:.uilabel}.
1. {% assign full-text = "In the **Create Input Flow**{:.uilabel} dialog, set **Input Flow Name**{:.uilabel} to " | append: chosenflowname | append: "." %}{{ full-text }}
1. Click **CREATE**{:.inline-button}.
{:.ol-steps}

{% if include.fullsteps %}
**Result**

  - Your new flow appears under **Input Flows**{:.uilabel} in the left panel.
  - The **Run Input Flow**{:.uilabel} wizard appears on the right.
{% endif %}


### {{parentnum}}2 - Configure and run {{ flownamebold }}.

{% if include.fullsteps %}
{%- assign full-imgpath=include.imgpath | append: "qs-4x-flows-load-data" | append: suf | append: ".png" -%}
{% include thumbnail.html imgfile=full-imgpath alttext="" imgclass="screenshot" tab="  " %}
{% endif %}

{% assign full-imgpath=include.imgpath | append: "qs-4x-flows-load-raw-input-files" | append: suf | append: ".png" %}
{% assign full-text="Under <span class='uilabel'>Input Files</span>, use the file browser to select " | append: datadir | append: "." %}
{% if include.fullsteps %}
{% include step-collapsed.html steptext=full-text stepimg=full-imgpath stepalt="Run Input Flow - Input Files" %}
{% else %}
1. {{ full-text }}
{% endif %}

{% assign full-imgpath=include.imgpath | append: "qs-4x-flows-load-raw-general-options" | append: suf | append: ".png" %}
{% assign full-text="Under <span class='uilabel'>General Options</span>, change <span class='uilabel'>Input File Type</span> to <span class='uilabel'>Delimited Text</span>." %}
{% if include.fullsteps %}
{% include step-collapsed.html steptext=full-text stepimg=full-imgpath stepalt="Run Input Flow - General Options" %}
{% else %}
1. {{ full-text }}
{% endif %}

{% assign full-imgpath=include.imgpath | append: "qs-4x-flows-load-raw-delimited-text-options" | append: suf | append: ".png" %}
{% assign full-text="Under <span class='uilabel'>Delimited Text Options</span>, enable the <span class='uilabel'>Generate URI?</span> option to automatically generate a unique URI for each document you load." %}
{% if include.fullsteps %}
{% include step-collapsed.html steptext=full-text stepimg=full-imgpath stepalt="Run Input Flow - Delimited Text Options" %}
{% else %}
1. {{ full-text }}
{% endif %}
1. Click **SAVE OPTIONS**{:.inline-button}. <!-- `MLCP options saved.` -->
1. Click **RUN IMPORT**{:.inline-button}. <!-- `(entity): (jobname) starting...` then `Job (job number) Finished. OK` -->
{:.ol-steps}

{% if include.fullsteps %}
**Result**

QuickStart displays a completion notice.

{% assign full-imgpath = include.imgpath | append: "qs-4x-flows-job-finished.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="Job Finished notice" imgclass="img-results" tab="  " %}
{% endif %}
