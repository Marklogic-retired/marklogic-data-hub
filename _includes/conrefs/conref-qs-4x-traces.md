{% assign pickitem="the document trace you want to view" %}
{% if include.pickitem %}{% assign pickitem=include.pickitem %}{% endif %}

The trace logs provide details about what goes in and out of each plugin in the flow during a specific job.

Each item in the trace log is a pass of one dataset item (with a unique **Identifier**{:.uilabel}) through the plugins included in the job (with a unique **Job ID**{:.uilabel}).

To view {{ pickitem }},

{% assign full-imgpath=include.imgpath | append: "qs-4x-traces-full.png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Traces list" imgclass="screenshot" tab="  " %}

1. In the QuickStart menu, click **Traces**{:.uimenuitem}.
1. In the list, click the row with {{ pickitem }}.
    {% include note-in-list.html type="TIP" content="You can filter the list by using the free-text search field or the faceted search filters." %}
{:.ol-steps}

{% assign full-imgpath=include.imgpath | append: "qs-4x-traces-content.png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Trace detail for the Content plugin" imgclass="screenshot" tab="  " %}

To view the input into and output from a specific plugin,
1. Click on the plugin button in the flow diagram.
{:.ol-steps}