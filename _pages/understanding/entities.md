---
layout: inner
title: Entities
permalink: /understanding/entities/
---

# Entities

Entities are the high-level business objects in your enterprise. They can be things like Employee, Product, Purchase Order, Department, etc.

With DHF, you can choose use abstract entities or MarkLogic 9's Entity Services. Entity Services is an out-of-the-box API and a set of conventions you can use within MarkLogic to quickly set up an application based on entity modeling. This means Entity Services handles the model definition and entity instance envelope documents for you via API calls. If you choose to use your own abstract entities, you will need to provide this framework yourself.

{% include note.html type="NOTE" content="MarkLogic strongly recommends that you use Entity Services unless you have specific needs that Entity Services cannot address." %}


## See Also
- [Introduction to Entity Services](https://docs.marklogic.com/guide/entity-services/intro)
- [Flows]({{site.baseurl}}/understanding/flows/)
- [Plugins]({{site.baseurl}}/understanding/plugins/)
- [Envelope Pattern]({{site.baseurl}}/understanding/envelope-pattern/)
