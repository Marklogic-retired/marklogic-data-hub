---
layout: inner
title: How Does it work?
lead_text: ''
permalink: /how/
---

![Hub Internals](https://raw.githubusercontent.com/marklogic/marklogic-data-hub/design/images/hub-internals-gray.png)

## Envelope Pattern
The MarkLogic Data Hub uses the Envelope data pattern to encapsulate data. Simply put, the envelope pattern wraps your data in either XML or JSON like so:

<div class="row">
<div class="col-md-6" markdown="1">

~~~
<envelope>
  <headers/>
  <triples/>
  <content>
    your data goes here
  </content>
</envelope>
~~~
{: .language-xml}

</div>
<div class="col-md-6" markdown="1">

~~~
{
  "headers": [],
  "triples": [],
  "content": {
    "your data": "goes here"
  }
}
~~~
{: .language-json}

</div>
</div>

The advantage to wrapping data is that you can retain the original data untouched (if you so desire) while allowing you to add additional data.

As an example. Let's say you have 2 data sources that have gender information. Perhaps the field names and the formats differ.

<div class="row">
<div class="col-md-6" markdown="1">

**/source-1.json**

~~~
{
  "gender": "f"
}
~~~
{: .language-json}

</div>

<div class="col-md-6" markdown="1">

**/source-2.json**

~~~
{
  "gndr": "female"
}
~~~
{: .language-json}

</div>
</div>

With the envelope you can normalize the fields into a preferred format:

<div class="row">
<div class="col-md-6" markdown="1">

**/conformed-1.json**

~~~
{
  "headers": [
    { "normalizedGender": "female" }
  ],
  "triples": [],
  "content": {
    "gender": "f"
  }
}
~~~
{: .language-json}

</div>

<div class="col-md-6" markdown="1">

**/conformed-2.json**

~~~
{
  "headers": [
    { "normalizedGender": "female" }
  ],
  "triples": [],
  "content": {
    "gndr": "female"
  }
}
~~~
{: .language-json}

</div>
</div>

Now searching your data become much easier.

## Business Entities
The MarkLogic Data Hub groups your data into Business Entities. These are groupings of data that serve a common business function. An example may be Employees or Customers or SalesLeads.

## Ingest
During the Ingest phase data is loaded into MarkLogic's staging area. This data can be fed through Flows to create Enveloped versions of the data.

## Conform
During the Conformance phase data is processed in bulk. The data is moved from the Staging area into the Final area and processed into Envelopes via Flows.

## Flows
With each Business Entity you can define multiple Input and Conformance Flows. A Flow is a grouping of plugins that work together to create the envelope that holds your data. There is one plugin for each piece of the envelope (headers, triples, and content).

- **Content Plugin.** The content plugin tells the system which data to store in the content section of the envelope.
- **Headers Plugin.** The headers plugin returns a list of headers to store in the headers section of the envelope.
- **Triples Plugin.** The triples plugin returns a list of semantic triples to store in the triples section of the envelope.

Conformance Flows require two additional plugins:

- **Collector plugin.** The collector plugin returns a list of documents that will be batch processed by the conformance flow.
- **Writer plugin.** The writer plugin is responsible for saving the final envelope to disk.
