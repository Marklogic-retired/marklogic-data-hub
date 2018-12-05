---
layout: inner
title: Plugins in Flows
lead_text: ''
permalink: /understanding/plugins/
---

# Plugins in Flows

MarkLogic DHF uses different plugin modules within flows to generate parts of the envelope (content, headers, and triples) and to perform other tasks.

An input flow is comprised of four plugins; a harmonize flow is comprised of six plugins.

| input flow | harmonize flow | mode |
|------------|----------------|------|
| Main Plugin | Main Plugin | n/a |
| n/a | Collector Plugin | query mode |
| Content Plugin | Content Plugin | query mode |
| Headers Plugin | Headers Plugin | query mode |
| Triples Plugin | Triples Plugin | query mode |
| n/a | Writer Plugin | update mode |
{:.table-b1gray}


## Main Plugin
The main plugin orchestrates the running of other plugins within the flow.


## Collector Plugin

The collector plugin returns the IDs and/or document URIs of the set of items that subsequent plugins would process as a batch. Only used in harmonize flows; input flows run on one document at a time and, therefore, do not need collectors. **NOTE: This plugin runs in query mode.**

To create your own collector plugin, it must be defined either as an XQuery module or as a JavaScript plugin.

### XQuery
```xquery
xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Collect IDs plugin
 :
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - a sequence of ids or uris
 :)
declare function plugin:collect(
  $options as map:map) as xs:string*
{
  cts:uris((), (), cts:true-query())
};
```

### JavaScript
```javascript
/*
 * Collect IDs plugin
 *
 * @param options - a map containing options. Options are sent from Java
 *
 * @return - an array of ids or uris
 */
function collect(options) {
  return cts.uris(null, null, cts.trueQuery());
}

module.exports = {
  collect: collect
};

```


## Content Plugin

A content plugin copies all or parts of the input data to fill in the **instance** section of the envelope. **NOTE: This plugin runs in query mode.**

To create your own content plugin, it must be defined either as an XQuery module or as a JavaScript plugin.

### XQuery
```xquery
xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare option xdmp:mapping "false";

(:~
 : Create Content Plugin
 :
 : @param $id          - the identifier returned by the collector
 : @param $options     - a map containing options. Options are sent from Java
 :
 : @return - your transformed content
 :)
declare function plugin:create-content(
  $id as xs:string,
  $options as map:map) as node()?
{
  let $doc := fn:doc($id)
  return
    if ($doc/envelope:envelope) then
      $doc/envelope:envelope/envelope:content/node()
    else if ($doc/content) then
      $doc/content
    else
      $doc
};
```

### JavaScript
```javascript
/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, options) {
  var doc = cts.doc(id);
  var root = doc.root;

  // for xml we need to use xpath
  if (root && xdmp.nodeKind(root) === 'element') {
    return root.xpath('/*:envelope/*:content/node()');
  }
  // for json we need to return the content
  else if (root && root.content) {
    return root.content;
  }
  // for everything else
  else {
    return doc;
  }
}

module.exports = {
  createContent: createContent
};
```


## Headers Plugin
A headers plugin extracts header information from the content to copy to the **headers** section of the envelope. This is useful for normalizing common fields (hire-date, last-updated, etc), which can be indexed for faster search operations. **NOTE: This plugin runs in query mode.**

To create your own headers plugin, it must be defined either as an XQuery module or as a JavaScript plugin.

### XQuery
```xquery
xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare option xdmp:mapping "false";

(:~
 : Create Headers Plugin
 :
 : @param $id      - the identifier returned by the collector
 : @param $content - the output of your content plugin
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - zero or more header nodes
 :)
declare function plugin:create-headers(
  $id as xs:string,
  $content as node()?,
  $options as map:map) as node()*
{
  ()
};
```

### JavaScript
```javascript
/*
 * Create Headers Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an array of header objects
 */
function createHeaders(id, content, options) {
  return [];
}

module.exports = {
  createHeaders: createHeaders
};
```


## Triples Plugin
A triples plugin extracts semantic triples from the source content and stores them in the **triples** section of the envelope. **NOTE: This plugin runs in query mode.**

To create your own triples plugin, it must be defined either as an XQuery module or as a JavaScript plugin.

### XQuery
```xquery
xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare option xdmp:mapping "false";

(:~
 : Create Triples Plugin
 :
 : @param $id      - the identifier returned by the collector
 : @param $content - the output of your content plugin
 : @param $headers - the output of your headers plugin
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - zero or more triples
 :)
declare function plugin:create-triples(
  $id as xs:string,
  $content as node()?,
  $headers as node()*,
  $options as map:map) as sem:triple*
{
  ()
};
```

### JavaScript
```javascript
/*
 * Create Triples Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param headers  - the output of your heaaders plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an array of triples
 */
function createTriples(id, content, headers, options) {
  return [];
}

module.exports = {
  createTriples: createTriples
};
```


## Writer Plugin
A writer plugin saves the final envelope to the database. **NOTE: This plugin runs in update mode.**

To create your own writer plugin, it must be defined either as an XQuery module or as a JavaScript plugin.

### XQuery
```xquery
xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Writer Plugin
 :
 : @param $id       - the identifier returned by the collector
 : @param $envelope - the final envelope
 : @param $options  - a map containing options. Options are sent from Java
 :
 : @return - nothing
 :)
declare function plugin:write(
  $id as xs:string,
  $envelope as node(),
  $options as map:map) as empty-sequence()
{
  xdmp:document-insert($id, $envelope)
};
```

### JavaScript
```javascript
/*~
 * Writer Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param envelope - the final envelope
 * @param options  - an object options. Options are sent from Java
 *
 * @return - nothing
 */
function write(id, envelope, options) {
  xdmp.documentInsert(id, envelope);
}

module.exports = {
  write: write
};
```


## See Also
- [Entities]({{site.baseurl}}/understanding/entities/)
- [Plugins]({{site.baseurl}}/understanding/plugins/)
- [Envelope Pattern]({{site.baseurl}}/understanding/envelope-pattern/)
