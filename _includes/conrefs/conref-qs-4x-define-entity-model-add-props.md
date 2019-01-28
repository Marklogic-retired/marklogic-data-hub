<li>{% if include.counter == 0 %}In the <span class="uilabel">{{ include.entityname }}</span> entity editor, click <span class="circle-button">+</span> in the <span class="uilabel">Properties</span> section to add a new property.
{% else %}Click <span class="circle-button">+</span> again to add another property.{% endif %}

  <ol class="ol-substeps">

    <li>Set <span class="uilabel">Name</span> to <code>{{ include.propname }}</code>.</li>

    {% if include.propentitytype %}
      <li>
        {% assign pref="qs-4x-entities-add-properties-type-entities" %}
        {% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% else %}{% assign suf="" %}{% endif %}
        {% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
        {% assign full-text="Set <span class='uilabel'>Type</span> to the entity <span class='uilabel'>" | append: include.propentitytype | append: "</span>." %}
        {% include step-collapsed.html steptext=full-text stepimg=full-imgpath imgclass="screenshot" nonum=true %}
      </li>
    {% else %}
      <li>Set <span class="uilabel">Type</span> to <code>{{ include.proptype }}</code>.</li>
    {% endif %}

    {% if include.propindexes contains "key" %}<li>To make <code>{{ include.propname }}</code> the primary key, click the area in the key <span><i class='fa fa-key'></i></span> column for the <code>{{ include.propname }}</code> row.</li>{% endif %}

    {% if include.propindexes contains "element range" %}<li>To specify that <code>{{ include.propname }}</code> needs an element range index, click the area in the lightning bolt <span><i class='fa fa-bolt'></i></span> column for the <code>{{ include.propname }}</code> row.</li>{% endif %}

    {% if include.propindexes contains "pii" %}<li>To mark <code>{{ include.propname }}</code> as PII, click the area in the key <span><i class='fa fa-lock'></i></span> column for the <code>{{ include.propname }}</code> row.</li>{% endif %}

    {% if include.propcardinality %}
      <li>To indicate that a(n) <span class="uilabel">{{ include.entityname }}</span> instance can have multiple instances of this property, set <span class="uilabel">Cardinality</span> to <span class="uilabel">1..∞</span>.</li>
    {% endif %}

  </ol>

</li>