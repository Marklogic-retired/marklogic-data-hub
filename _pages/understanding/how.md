---
layout: inner
title: How It Works
lead_text: ''
permalink: /understanding/how-it-works/
---

## Envelope Pattern
The Data Hub Framework uses the Envelope data pattern to encapsulate data. Simply put, the Envelope pattern wraps your data in either XML or JSON like so:

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
  "content": {
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
  "content": {
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

## Entities, Flows, and Plugins. Oh My!
The MarkLogic Data Hub Framework is organized into **Entities**, **Flows**, and **Plugins**.

### Entities
Entities are the high level business objects in your enterprise. They can be things like Employee, Product, Purchase Order, Department, etc.

With the DHF you have a choice between using abstract entities or Entity Services. **TODO** - discuss differences between Entity Services and non-ES.

### Flows
Flows are the means by which you harmonize your data. There are two types of Flows: **Input** and **Harmonize**. Flows belong to Entities. Think of a flow as a way of creating an envelope that represents an entity. Flows are made up of Plugins.

#### Input Flows

Input Flows are specialized Flows that get invoked via MLCP or the REST API as transforms that process one incoming document before it gets written into MarkLogic. Because these flows run as transforms, they are not responsible for persisting data. They merely transform the given data into envelopes. It is MLCP or the REST API that will write the final, transformed document into MarkLogic.

Input Flows are useful for tracking information about data in your Staging Database.
 - Which system did the data come from?
 - What date/time was the data loaded?
 - Who loaded the data?
 - Has the data been harmonized yet?

Input Flows consist of four parts:
 - **Main Plugin.** The main plugin orchestrates the running of the other 3 plugins.
- **Content Plugin.** The content plugin tells the system which data to store in the **instance** section of the envelope.
- **Headers Plugin.** The headers plugin returns a list of headers to store in the **headers** section of the envelope.
- **Triples Plugin.** The triples plugin returns a list of semantic triples to store in the **triples** section of the envelope.

#### Harmonize Flows

Harmonize Flows are meant to run in batches. The primary purpose of the Data Hub Framework is to run Harmonize Flows.

Harmonize Flows have six plugins:

There is one plugin for each piece of the envelope (headers, triples, and content).

- **Main Plugin.** The main plugin orchestrates the running of the other 5 plugins.
- **Collector Plugin.** The collector plugin returns a list of strings that will be batch processed by the harmonize flow. These strings can be anything from document URIs in the database to IDs. Collectors are only used for Harmonize Flows. Harmonize Flows run as batches and need a list of things to operate on. Input Flows run per document and do not need Collectors.
- **Content Plugin.** The content plugin tells the system which data to store in the **instance** section of the envelope.
- **Headers Plugin.** The headers plugin returns a list of headers to store in the **headers** section of the envelope.
- **Triples Plugin.** The triples plugin returns a list of semantic triples to store in the **triples** section of the envelope.
- **Writer Plugin.** The writer plugin is responsible for saving the final envelope to disk.

Because Harmonize Flows run in batches, the DHF uses the [Data Movement SDK (DMSDK)](https://developer.marklogic.com/learn/data-movement-sdk) to orchestrate the batching.
<br>
<div class="text-center" style="font-style: italic">This data flow diagram details how a Harmonize Flow is executed.</div>
![Harmonize Flow Overview]({{site.baseurl}}/images/2x/harmonize-flow-diagram.png 'This data flow diagram details how a Harmonize Flow is executed.'){: .center-image }

**But I don't want to run my Harmonize Flow in batches!** - See our [FAQ](../faqs.md#how-can-i-run-a-harmonize-flow-immediately-for-1-document) about this.
