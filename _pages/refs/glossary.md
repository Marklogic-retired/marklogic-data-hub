---
layout: inner
title: Glossary
permalink: /refs/glossary/
redirect_from: "/glossary/"
---

# Data Hub Framework (DHF) Glossary

<dl>

<dt>Entities</dt>
<dd>XML or JSON representations of high-level business objects in your enterprise. Examples of business objects are employee, product, purchase order, and department.
*See also: [Envelope Pattern - Entities]({{site.baseurl}}/understanding/how-it-works/#entities)*
</dd>

<dt>Entity Services</dt>
<dd>An out-of-the-box API and a set of conventions you can use within MarkLogic to quickly set up an application based on entity modeling.
</dd>

<dt>Envelope</dt>
<dd>A set of metadata wrapped around the original entity/data, including harmonized parts of the entity.
*See also: [Envelope Pattern]({{site.baseurl}}/understanding/how-it-works/) and [Envelope Design Pattern (developer.marklogic.com)](https://developer.marklogic.com/blog/envelope-design-pattern)*
</dd>

<dt>Flow</dt>
<dd>A series of actions that process the data. Flows are implemented using a chain of plugins that perform sequential or concurrent steps in the process. The two types of flows are input and harmonize. *See also: [Envelope Pattern - Flows and Plugins]({{site.baseurl}}/understanding/how-it-works/#flows-and-plugins)*
</dd>

<dt>Flow tracing</dt>
<dd>The process that logs information about the flows as they run. Inputs to and outputs from every plugin of every flow are recorded into the JOBS database. *See also: [Flow Tracing]({{site.baseurl}}/understanding/flowtracing/)*
</dd>

<dt>Harmonization</dt>
<dd>The DHF process of creating a canonical model of your data using only the parts you need and leaving the rest as-is.
</dd>

<dt>Harmonize flow</dt>
<dd>The type of flow that creates a canonical model of your data using only the parts you need and leaving the rest as-is. The harmonize flow is the most common type of flows in DHF and is typically run in batches.
*See also: [Envelope Pattern - Harmonize Flows]({{site.baseurl}}/understanding/how-it-works/#harmonize-flows)*
</dd>

<dt>Ingestion</dt>
<dd>The DHF process that uses an input flow to pull documents into the Data Hub.
</dd>

<dt>Input flow</dt>
<dd>The type of flow that processes each incoming document before it is written into MarkLogic. Input flows are invoked by the MarkLogic Content Pump (MLCP), the Java Client API, or the REST Client API.
*See also: [Envelope Pattern - Input Flows]({{site.baseurl}}/understanding/how-it-works/#input-flows)*
</dd>

<!-- BUGBUG: Uncomment after DHFPROD-1213 is resolved.
<dt>Provenance and Lineage</dt>
<dd>The DHF process that ensures that the data can be traced back to its origin and that the source data is preserved.
</dd>
-->

</dl>
