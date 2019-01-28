{% if include.fullsteps %}
To define the `{{ include.entityname }}` entity model,

{% assign pref="qs-4x-entities-add-properties" %}
{% if include.entityname %}{% assign suf="-" | append: include.entityname %}{% else %}{% assign suf="" %}{% endif %}
{% assign full-imgpath=include.imgpath | append: pref | append: suf | append: ".png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="entity properties" imgclass="screenshot" tab="  " %}
{% endif %}

<ol class="ol-steps">

  {% if include.fullsteps %}<li>In QuickStart's navigation bar, click <span class="uimenuitem">Entities</span>.</li>{% endif %}

  <li>At the top of the <span class="uilabel">{{ include.entityname }}</span> entity card, click the pencil icon <span><i class='fa fa-pencil-alt'></i></span> to edit the <span class="uilabel">{{ include.entityname }}</span> entity definition.</li>

  {% assign counter = 0 %}
  {% for prop in site.data.tut4xentprops.[include.entityname] %}
    {% include conrefs/conref-qs-4x-define-entity-model-add-props.md
      entityname=include.entityname
      propname=prop.name
      proptype=prop.type
      propentitytype=prop.entitytype
      propcardinality=prop.cardinality
      propindexes=prop.indexes
      imgpath=include.imgpath
      counter=counter
    %}
    {% assign counter = counter | plus: 1 %}
  {% endfor %}

  <li>Click <span class="inline-button">SAVE</span>.</li>

  <li>
  {% assign full-imgpath=include.imgpath | append: "qs-4x-update-indexes-yes.png" %}
  {% assign full-text="If prompted to update the index, click <span class='inline-button'>Yes</span>." %}
  {% include step-collapsed.html steptext=full-text stepimg=full-imgpath imgclass="img-small" nonum=true %}
  </li>

  <li>
  {% assign full-imgpath=include.imgpath | append: "qs-4x-entities-resize-card.png" %}
  {% assign full-text="Drag the bottom-right corner of the entity card to resize it and see the newly added properties." %}
  {% include step-collapsed.html steptext=full-text stepimg=full-imgpath imgclass="img-small" nonum=true %}
  </li>

</ol>