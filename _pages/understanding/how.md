---
layout: inner
title: How It Works
lead_text: ''
permalink: /understanding/how-it-works/
---

## Envelope Pattern
The Data Hub Framework uses the envelope data pattern to encapsulate data. With the envelope pattern, the core content and metadata for that content are kept separate. The envelope pattern is used for both the ingest and harmonize flows in DHF (described below).

In practice, the envelope pattern wraps your data in either XML or JSON like so:

<div class="row">
<div class="col-md-6" markdown="1">

~~~

<envelope>
  <headers/>
  <triples/>
  <instance>
    your data goes here
  </instance>
</envelope>

~~~
{: .language-xml}

</div>
<div class="col-md-6" markdown="1">

~~~
{
  "envelope": {
    "headers": [],
    "triples": [],
    "instance": {
      "your data": "goes here"
    }
  }
}
~~~
{: .language-json}

</div>
</div>

The advantage to wrapping data is that you can retain the original data untouched (if you so desire) while allowing you to add additional data.

As an example. Let's say you have two data sources that have gender information. Perhaps the field names and the formats differ.

<div class="row">
<div class="col-md-6" markdown="1">

**/source-1.json**

~~~
{
  "gender": "f",
  "age": "32",
  ...,
  "firstName": "Rebecca"
}
~~~
{: .language-json}

</div>

<div class="col-md-6" markdown="1">

**/source-2.json**

~~~
{
  "gndr": "female",
  "age": "39",
  ...,
  "firstName": "Leona"
}
~~~
{: .language-json}

</div>
</div>

With the envelope you can normalize the fields into a preferred format:

<div class="row">
<div class="col-md-6" markdown="1">

**/harmonized-1.json**

~~~
{
  "headers": [
    { "normalizedGender": "female" }
  ],
  "triples": [],
  "instance": {
    "gender": "f",
    "age": "32",
    ...,
    "firstName": "Rebecca"
  }
}
~~~
{: .language-json}

</div>

<div class="col-md-6" markdown="1">

**/harmonized-2.json**

~~~
{
  "headers": [
    { "normalizedGender": "female" }
  ],
  "triples": [],
  "instance": {
    "gndr": "female",
    "age": "39",
    ...,
    "firstName": "Leona"
  }
}
~~~
{: .language-json}

</div>
</div>

Now searching your data becomes much easier because you have a consistent field name to query.

## Entities, Flows, and Plugins
The MarkLogic Data Hub Framework is organized into **entities**, **flows**, and **plugins**.

### Entities
Entities are the high-level business objects in your enterprise. They can be things like Employee, Product, Purchase Order, Department, etc.

With DHF you have a choice between using abstract entities or MarkLogic 9's Entity Services. We strongly recommend you use Entity Services unless you have specific needs that Entity Services cannot address. Entity Services is an out-of-the-box API and a set of conventions you can use within MarkLogic to quickly stand up an application based on entity modeling. This means Entity Services handles the model definition and entity instance envelope documents for you via API calls. If you choose to use your own abstract entities, you will need to provide this framework yourself.

More detailed information can be found in the [Introduction to Entity Services](https://docs.marklogic.com/guide/entity-services/intro) developer guide.

### Flows and Plugins
Flows are the means by which you harmonize your data. There are two types of flows: **input** and **harmonize**. Flows belong to entities. Think of a flow as a way of creating an envelope that represents an entity. Flows are made up of plugins.

#### Input Flows

Input flows are specialized flows that get invoked via MLCP, the Java Cleint API, or the REST Client API as transforms that process one incoming document before it gets written into MarkLogic. Because these flows run as transforms, they are not responsible for persisting data. They merely transform the given data into envelopes. It is MLCP, the Java Client API, or the REST Client API that will write the final, transformed document into MarkLogic.

Input flows are useful for tracking information about data in your Staging Database.
 - Which system did the data come from?
 - What date/time was the data loaded?
 - Who loaded the data?
 - Has the data been harmonized yet?
 
<!--- DHFPROD-646 TODO more clearly describe what a plugin is -->

Input flows consist of four parts:
- **Main Plugin**: Orchestrates the running of the other three plugins.
- **Content Plugin**: Determines which data to store in the **instance** section of the envelope.
- **Headers Plugin**: Returns a list of headers to store in the **headers** section of the envelope.
- **Triples Plugin**: Returns a list of semantic triples to store in the **triples** section of the envelope.

#### Harmonize Flows

Harmonization is the process of creating a canonical model of your data using only the parts you need and leaving the rest as-is. Harmonize flows harmonize your ingested data and are meant to run in batches. The primary purpose of the Data Hub Framework is to run harmonize flows.

Harmonize flows have six plugins. There is one plugin for each piece of the envelope (headers, triples, and content):

- **Main Plugin**: Orchestrates the running of the other five plugins.
- **Collector Plugin**: Returns a list of strings that will be batch processed by the harmonize flow. These strings can be anything from document URIs in the database to IDs. Collectors are only used for harmonize flows. harmonize flows run as batches and need a list of things to operate on. Input flows run per document and do not need collectors.
- **Content Plugin**: Determines which data to store in the **instance** section of the envelope.
- **Headers Plugin**: Returns a list of headers to store in the **headers** section of the envelope.
- **Triples Plugin**: Returns a list of semantic triples to store in the **triples** section of the envelope.
- **Writer Plugin**: Responsible for saving the final envelope to disk.

Because harmonize flows run in batches, DHF uses the [Data Movement SDK (DMSDK)](https://developer.marklogic.com/learn/data-movement-sdk) to orchestrate the batching.
<br>
<div class="text-center" style="font-style: italic">This data flow diagram details how a harmonize flow is executed.</div>
<!--- DHFPROD-646 TODO consistency, update image to reference all plugins above -->
![Harmonize Flow Overview]({{site.baseurl}}/images/2x/harmonize-flow-diagram.png 'This data flow diagram details how a harmonize flow is executed.'){: .center-image }

**But I don't want to run my harmonize flow in batches!** - See our [FAQ](../faqs.md#how-can-i-run-a-harmonize-flow-immediately-for-1-document) about this.
