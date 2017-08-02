---
layout: inner
title: How Does it work?
lead_text: ''
permalink: /how/
---

<p style="font-style: italic; font-size:12px;">The MarkLogic Data Hub Framework is free and open source under the <a href="https://github.com/marklogic-community/marklogic-data-hub/blob/1.0-master/LICENSE">Apache 2 License</a> and is supported by the community of developers who build and contribute to it. Please note that Data Hub Framework is not a supported MarkLogic product.</p>

The MarkLogic Data Hub Framework is organized into Entities, Flows, and Plugins.

![Hub Internals](//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/design/images/hub-internals-gray.png){: .center-image }

## Envelope Pattern
The MarkLogic Data Hub Framework uses the Envelope data pattern to encapsulate data. Simply put, the Envelope pattern wraps your data in either XML or JSON like so:

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

**/harmonized-1.json**

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

**/harmonized-2.json**

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

## Entities
The MarkLogic Data Hub Framework groups your data into Entities. These Entities are logical groupings of data that serve a common business function. An example may be Employees or Customers or SalesLeads. If you choose to use Entity Services in MarkLogic 9 then your entities have json definitions and can be modeled with a UI Modeling tool. The json definitions can then be used to generate source code, range index settings, search options, and validation.

## Ingest
During the Ingest phase, data is loaded into MarkLogic's staging area. This data can be fed through Flows to create Enveloped versions of the data. You would want to wrap your incoming data in envelopes to track provenance or lineage. _Who loaded this data? Where did this data come from? When was this data loaded?_

## Harmonize
During the Harmonize phase, data is processed in bulk. The data is moved from the Staging area into the Final area and processed into Envelopes via Flows.

## Flows
With each Business Entity you can define multiple Input and Harmonize Flows. A Flow is a grouping of plugins that work together to create the envelope that holds your data. There is one plugin for each piece of the envelope (headers, triples, and content).

- **Content Plugin.** The content plugin tells the system which data to store in the content section of the envelope.
- **Headers Plugin.** The headers plugin returns a list of headers to store in the headers section of the envelope.
- **Triples Plugin.** The triples plugin returns a list of semantic triples to store in the triples section of the envelope.

Harmonize Flows require two additional plugins:

- **Collector Plugin.** The collector plugin returns a list of strings that will be batch processed by the harmonize flow. These strings can be anything from document URIs in the database to IDs. Collectors are only used for Harmonize Flows. Harmonize Flows run as batches and need a list of things to operate on. Input Flows run per document and do not need Collectors.
- **Writer Plugin.** The writer plugin is responsible for saving the final envelope to disk. \*The writer plugin is not present for the Input flow because the caller is responsible for writing. Typically the caller is [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"} or the [MarkLogic REST API](https://docs.marklogic.com/REST/client){:target="_blank"}

![Harmonize Flow Overview]({{site.baseurl}}/images/2x/harmonize-flow-diagram.png){: .center-image }
