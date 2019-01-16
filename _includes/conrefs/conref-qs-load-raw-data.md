To configure and run the `{{ include.jobname }}` input flow,

{% assign pref="qs-4x-flows-load-data" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="" class="screenshot" tab="  " %}

1. Click **{{ include.jobname }}**{:.uilabel} under **Input Flows**{:.uilabel}.

    **Result:** The **Run Input Flow**{:.uilabel} wizard appears.

{% assign full-imgpath=include.imgpath | append: "qs-4x-flows-load-raw-input-files" | append: suf | append: ".png" %}
{% assign full-text="Under <span class='uilabel'>Input Files</span>, use the file browser to select the <code>" | append: include.datadir | append: "</code> directory." %}
{% include step-collapsed.html
   steptext=full-text
   stepimg=full-imgpath
   stepalt="Run Input Flow - Input Files"
%}
{% assign full-imgpath=include.imgpath | append: "qs-4x-flows-load-raw-general-options" | append: suf | append: ".png" %}
{% include step-collapsed.html
   steptext="Under <span class='uilabel'>General Options</span>, change <span class='uilabel'>Input File Type</span> to <span class='uilabel'>Delimited Text</span>."
   stepimg=full-imgpath
   stepalt="Run Input Flow - General Options"
%}
{% assign full-imgpath=include.imgpath | append: "qs-4x-flows-load-raw-delimited-text-options" | append: suf | append: ".png" %}
{% include step-collapsed.html
   steptext="Under <span class='uilabel'>Delimited Text Options</span>, enable the <span class='uilabel'>Generate URI?</span> option to automatically generate a unique URI for each document you load."
   stepimg=full-imgpath
   stepalt="Run Input Flow - Delimited Text Options"
%}
1. Click **SAVE OPTIONS**{:.inline-button}.
1. Click **RUN IMPORT**{:.inline-button}.
{:.ol-steps}

**Result**

QuickStart displays a completion notice.

{% assign full-imgpath = include.imgpath | append: "qs-4x-flows-job-finished.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="Job Finished notice" class="screenshot" tab="  " %}