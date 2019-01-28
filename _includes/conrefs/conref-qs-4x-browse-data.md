{% assign pickdb="the STAGING database or the FINAL database" %}
{% if include.pickdb %}{% assign pickdb=include.pickdb %}{% endif %}

{% assign pickitem="the dataset item you want to view" %}
{% if include.pickitem %}{% assign pickitem=include.pickitem %}{% endif %}


{% assign full-imgpath=include.imgpath | append: "qs-4x-browse-data-full.png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Browse Data view" imgclass="screenshot" tab="  " %}

1. In the QuickStart menu, click **Browse Data**{:.uimenuitem}.
1. From the database selection dropdown, choose {{ pickdb }}.
1. To narrow the list to include entities only, check the **Entities Only**{:.uilabel} box.
    {% include note-in-list.html type="TIP" content="You can further filter the list by using the free-text search field or the faceted search filters." %}
1. In the list, click the row of {{ pickitem }}.
{:.ol-steps}