{% comment %}
  Simple iteration through tut4xtoc.yml:
  - If item has a url, then create a link, except when it's the current page.
  - If item has no url, then iterate through its child pages the same way, except indented.
  Does not handle grandchildren.
{% endcomment %}
<div markdown="1" class="{{ include.class }}">
{% if include.currpage<>"home" %}
[Tutorial Home]({{site.baseurl}}/tutorial/4x/)
{% endif %}
{% for item in site.data.tut4xtoc %}
  {% if item.url %}
    {% if page.permalink==item.url %}
1. **{{ item.text }}**
    {% else %}
1. [{{ item.text }}]({{ site.baseurl }}{{ item.url }})
    {% endif %}
  {% else %}
1. {{ item.text }}
    {% for subitem in item.childPages %}
      {% if subitem.url %}
        {% if page.permalink==subitem.url %}
    1. **{{ subitem.text }}**
        {% else %}
    1. [{{ subitem.text }}]({{ site.baseurl }}{{ subitem.url }})
        {% endif %}
      {% else %}
    1. {{ subitem.text }}
      {% endif %}
    {% endfor %}
  {% endif %}
{% endfor %}
</div>