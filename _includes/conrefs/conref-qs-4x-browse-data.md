{% assign pickdbphrase="the STAGING database or the FINAL database" %}
{% if include.pickdb %}{% assign pickdbphrase="the **" | append: include.pickdb | append: "** database" %}{% endif %}

{% assign pickitem="the dataset item you want to view" %}
{% if include.pickitem %}{% assign pickitem=include.pickitem %}{% endif %}

{% assign pref="qs-4x-browse-data" %}
{% if include.pickdb %}{% assign suf="-" | append: include.pickdb %}{% else %}{% assign suf="" %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Browse Data" imgclass="screenshot" tab="  " %}

1. In the QuickStart menu, click **Browse Data**{:.uimenuitem}.
1. From the database selection dropdown, choose {{ pickdbphrase }}.
1. (Optional) To narrow the list to include entities only, check the **Entities Only**{:.uilabel} box.
    {% include note-in-list.html type="TIP" content="You can further filter the list by using the free-text search field or the faceted search filters." %}
1. In the list, click the row of {{ pickitem }}.
{:.ol-steps}