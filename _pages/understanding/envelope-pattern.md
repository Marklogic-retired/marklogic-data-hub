---
layout: inner
title: Envelope Pattern
permalink: /understanding/envelope-pattern/
redirect_from: "/understanding/how-it-works/"
---

# Envelope Pattern
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


## See Also
- [Entities](/understanding/entities/)
- [Flows](/understanding/flows/)
- [Plugins](/understanding/plugins/)
