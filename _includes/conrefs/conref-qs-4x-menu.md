{% assign full-imgpath = site.baseurl | append: "/images/4x/" | append: "qs-4x-menubar.png" %}

{% assign full-msg = "In QuickStart's navigation bar, click <span class='uimenuitem'>" | append: include.selection | append: "</span>." %}

{% assign basic-style = "position: absolute; height: 50%; border: 3px solid #73AD21; " %}

{% if    include.selection == "Dashboard" %}
    {% assign circle-style = basic-style | append: "left: 20px;" %}
{% elsif include.selection == "Entities" %}
    {% assign circle-style = basic-style | append: "left: 40px;" %}
{% elsif include.selection == "Flows" %}
    {% assign circle-style = basic-style | append: "left: 60px;" %}
{% elsif include.selection == "Mappings" %}
    {% assign circle-style = basic-style | append: "left: 80px;" %}
{% elsif include.selection == "Browse Data" %}
    {% assign circle-style = basic-style | append: "left: 100px;" %}
{% elsif include.selection == "Jobs" %}
    {% assign circle-style = basic-style | append: "left: 120px;" %}
{% elsif include.selection == "Traces" %}
    {% assign circle-style = basic-style | append: "left: 140px;" %}
{% elsif include.selection == "Settings" %}
    {% assign circle-style = basic-style | append: "left: 160px;" %}
{% elsif include.selection == "logout" %}
    {% assign circle-style = basic-style | append: "left: 180px;" %}
{% endif %}

{% if include.noimage %}
{{ full-msg }}
{% else %}
1. <details><summary>{{ full-msg }}</summary>

     <img src="{{ full-imgpath }}" alt="QuickStart menu" class="screenshot"/>

   </details>
{% endif %}