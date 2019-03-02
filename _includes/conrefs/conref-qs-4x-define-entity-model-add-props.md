{% if include.entityname %}
  {%- assign entityeditor="the <span class='uilabel'>" | append: include.entityname | append: "</span> entity editor" -%}
  {%- assign suf="-" | append: include.entityname -%}
{% else %}
  {%- assign entityeditor="the entity editor" -%}
  {%- assign suf="" -%}
{% endif %}

{% if include.propname %}
  {%- assign propname="<code>" | append: include.propname | append: "</code>" -%}
  {%- assign thisprop="<code>" | append: include.propname | append: "</code>" -%}
  {%- assign proprow="the <code>" | append: include.propname | append: "</code> row" -%}
{% else %}
  {%- assign propname="the name you choose for the property" -%}
  {%- assign thisprop="this property" -%}
  {%- assign proprow="the row for this property" -%}
{% endif %}


<li>
    {% if include.counter == -1 %}
      {%- assign stepcmd="In the entity editor, click <span class='circle-button'>+</span> in the <span class='uilabel'>Properties</span> section to add a new property." -%}
    {% elsif include.counter == 0 %}
      {%- assign stepcmd="In " | append: entityeditor | append: ", click <span class='circle-button'>+</span> in the <span class='uilabel'>Properties</span> section to add a new property." -%}
    {% else %}
      {%- assign stepcmd="Click <span class='circle-button'>+</span> again to add another property." -%}
    {% endif %}{{ stepcmd }}

  <ol class="ol-substeps">

    <li>Set <span class='uilabel'>Name</span> to {{ propname }}.</li>

    {% if include.propentitytype %}
      <li>
        {% assign full-imgpath=include.imgpath | append: "qs-4x-entities-add-properties-type-entities" | append: suf | append: ".png" %}
        {% assign full-text="Set <span class='uilabel'>Type</span> to the entity <span class='uilabel'>" | append: include.propentitytype | append: "</span>." %}
        {% include step-collapsed.html steptext=full-text stepimg=full-imgpath imgclass="screenshot" nonum=true %}
      </li>
    {% elsif include.proptype %}
      <li>Set <span class='uilabel'>Type</span> to <code>{{ include.proptype }}</code>.</li>
    {% else %}
      <li>Set <span class='uilabel'>Type</span> to the expected data type of the property.</li>
    {% endif %}

    {% if include.propindexes contains "key" %}<li>To make {{ thisprop }} the primary key, click the area in the key <span><i class='fa fa-key'></i></span> column for {{ proprow }}.</li>{% endif %}

    {% if include.propindexes contains "element range" %}<li>To specify that {{ thisprop }} needs an element range index, click the area in the lightning bolt <span><i class='fa fa-bolt'></i></span> column for {{ proprow }}.</li>{% endif %}

    {% if include.propindexes contains "pii" %}<li>To mark {{ thisprop }} as PII, click the area in the key <span><i class='fa fa-lock'></i></span> column for {{ proprow }}.</li>{% endif %}

    {% if include.propcardinality %}<li>To indicate that the entity can have multiple instances of this property, set <span class='uilabel'>Cardinality</span> to <span class='uilabel'>1..∞</span>.</li>{% endif %}

  </ol>
</li>