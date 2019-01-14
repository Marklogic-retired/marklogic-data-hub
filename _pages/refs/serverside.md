---
layout: inner
title: DHF Server-Side Library
permalink: /refs/server-side-library/
redirect_from: "/docs/server-side/"
---

# DHF Server-Side Library

The `/MarkLogic/data-hub-framework/dhf.xqy` library module exposes functions to make interacting with the Data Hub Framework from your XQuery or JavaScript code easier.

## Including the Library

{% include codetabs.html javascript=site.data.dhflib.require.js xquery=site.data.dhflib.require.xqy %}

## DHF-LIB Functions

- [Run](#run)
- [Run Writer](#run-writer)
- [Make Envelope](#make-envelope)
- [Make Legacy Envelope](#make-legacy-envelope)
- [Context](#context)
- [Content Context](#content-context)
- [Headers Context](#headers-context)
- [Triples Context](#triples-context)
- [Writer Context](#writer-context)
- [Add Trace Input](#add-trace-input)
- [Log Trace](#log-trace)

### Run

Runs a given function as a plugin. This method provides tracing around your function. Tracing will catch uncaught exceptions and log them into the traces database.

```xquery
declare function dhf:run($context as json:object, $func)
```

#### Parameters
- context - the context for this plugin
- func - the function to run

#### Returns
returns whatever your function returns

#### Usage

{% include codetabs.html javascript=site.data.dhflib.run.js xquery=site.data.dhflib.run.xqy %}

---

### Run Writer

Runs a writer plugin. This function is needed to run a writer in update mode. All of the DHF plugins run in query-only mode and thus cannot persist data. Running your writer with this function allows you to persist data.

```xquery
declare function dhf:run-writer($writer-function, $id as xs:string+, $envelope as item(), $options as map:map)
```
#### Parameters

 - **writer-function** - the writer function to run. It must be an xdmp:function. See the examples below for more info.
 - **id** - the id for the current flow execution
 - **envelope** - the envelope to write
 - **options** - a map:map of options

#### Usage

{% include codetabs.html javascript=site.data.dhflib.runwriter.js xquery=site.data.dhflib.runwriter.xqy %}

---

### Make Envelope

Creates an envelope in the desired format (XML or JSON). If the data format is XML, then the namespace is `http://marklogic.com/entity-services`.

```xquery
declare function dhf:make-envelope($content, $headers, $triples, $data-format) as document-node()
```

#### Parameters

 - **content** - the content section of the envelope
 - **headers** - the headers section of the envelope
 - **triples** - the triples section of the envelope
 - **data-format** - the format to use for making the envelope (xml|json)

#### Returns
Either an XML or JSON envelope (depending on data-format).

#### Usage

{% include codetabs.html javascript=site.data.dhflib.makeenvelope.js xquery=site.data.dhflib.makeenvelope.xqy %}

---

### Make Legacy Envelope

Creates a legacy envelope in the desired format (XML or JSON). If the data format is XML then the namespace is `http://marklogic.com/data-hub/envelope`. This function is for users who upgraded from 1.x and have legacy envelopes already in production.


```xquery
declare function dhf:make-legacy-envelope($content, $headers, $triples, $data-format) as document-node()
```

#### Parameters

- **content** - the content section of the envelope
- **headers** - the headers section of the envelope
- **triples** - the triples section of the envelope
- **data-format** - the format to use for making the envelope (xml|json)

#### Returns
Either an XML or JSON envelope (depending on data-format).

#### Usage

{% include codetabs.html javascript=site.data.dhflib.makelegacyenvelope.js xquery=site.data.dhflib.makelegacyenvelope.xqy %}

---

### Context

Creates a generic context for use in any plugin. Contexts are passed to the [the Run function](#run). A Context defines information needed for proper tracing.

```xquery
declare function dhf:context($label as xs:string) as json:object
```

#### Parameters
 - **label** - the label to give this plugin for tracing

#### Returns
A context object for use in [the Run function](#run)

#### Usage
{% include codetabs.html javascript=site.data.dhflib.context.js xquery=site.data.dhflib.context.xqy %}

---

### Content Context

Creates a context for a content plugin. This is a convenience method for [Context](#context) and merely uses the label "content".

```xquery
declare function dhf:content-context([$raw-content]) as json:object
```

#### Parameters
- **raw-content** (optional) - the raw content passed into an input flow

#### Returns
A context object for use in [the Run function](#run). This context object contains the label "content"

#### Usage

{% include codetabs.html javascript=site.data.dhflib.contentcontext.js xquery=site.data.dhflib.contentcontext.xqy %}

---

### Headers Context

Creates a context for a headers plugin. This is a convenience method for [Context](#context) and merely uses the label "headers".

```xquery
declare function dhf:headers-context($content) as json:object
```

#### Parameters
- **content** - the output from the content plugin

#### Returns
A context object for use in [the Run function](#run). This context object contains the label "headers"

#### Usage

{% include codetabs.html javascript=site.data.dhflib.headercontext.js xquery=site.data.dhflib.headercontext.xqy %}

---

### Triples Context

Creates a context for a triples plugin. This is a convenience method for [Context](#context) and merely uses the label "triples".

```xquery
declare function dhf:triples-context($content, $headers) as json:object
```

#### Parameters
- **content** - the output from the content plugin
- **headers** - the output from the headers plugin

#### Returns
A context object for use in [the Run function](#run). This context object contains the label "triples"

#### Usage

{% include codetabs.html javascript=site.data.dhflib.triplescontext.js xquery=site.data.dhflib.triplescontext.xqy %}

---

### Writer Context

Creates a context for a writer plugin. This is a convenience method for [Context](#context) and merely uses the label "writer".

```xquery
declare function dhf:writer-context($envelope) as json:object
```

#### Parameters
- **envelope** - the envelope you constructed

#### Returns
A context object for use in [the Log Trace function](#log-trace). This context object contains the label "writer"

#### Usage

{% include codetabs.html javascript=site.data.dhflib.writercontext.js xquery=site.data.dhflib.writercontext.xqy %}

---

### Add Trace Input
Adds a trace input to the context. You can add as many trace inputs as you like so long as each one has a unique label. These inputs are later logged into traces if/when they are logged.

```xquery
declare function dhf:add-trace-input($context as json:object, $input-label as xs:string, $input) as json:object
```

#### Parameters
 - **context** - the context
 - **input-label** - the label for the input
 - **input** - the input to add to the context


#### Returns
 Returns the passed in $context with the new inputs added.

#### Usage

{% include codetabs.html javascript=site.data.dhflib.addtraceinput.js xquery=site.data.dhflib.addtraceinput.xqy %}

---

### Log Trace
Logs a trace, but only if tracing is enabled.

```xquery
declare function dhf:log-trace($context as json:object)
```

#### Parameters
 - **context** - the context

#### Returns
 Nothing

#### Usage

{% include codetabs.html javascript=site.data.dhflib.logtrace.js xquery=site.data.dhflib.logtrace.xqy %}
