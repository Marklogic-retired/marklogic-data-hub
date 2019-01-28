{% if include.fullsteps %}
{% assign pickitem="the job you want to view" %}
{% if include.pickitem %}{% assign pickitem=include.pickitem %}{% endif %}

To view the results of {{ pickitem }},

{% assign full-imgpath=include.imgpath | append: "qs-4x-jobs-full.png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Jobs log" imgclass="screenshot" tab="  " %}{% endif %}

1. In the QuickStart menu, click **Jobs**{:.uimenuitem} to open the Jobs list.
1. In the list, click **&gt;_**{:.inline-button} for {{ pickitem }}.
    {% include note-in-list.html type="TIP" content="You can filter the list by using the free-text search field or the faceted search filters." %}
{:.ol-steps}