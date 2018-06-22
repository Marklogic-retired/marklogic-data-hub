---
layout: inner
title: Getting Started Tutorial 3.x<br>Serve the Data Out of MarkLogic
lead_text: ''
permalink: /tutorial/serve-data/
---

<!--- DHFPROD-646 https://github.com/marklogic/marklogic-data-hub/issues/790#issuecomment-373201418 -->

You have just successfully loaded two data sources and harmonized them both.

Now you can access your data via several REST endpoints. Your harmonized data is available on the Final HTTP server on port 8011 by default. A full list of REST endpoints is described in the [Client API documentation](https://docs.marklogic.com/REST/client){:target="_blank"}.

You can access hub data in the Staging database via the [Staging search endpoint](http://localhost:8010/v1/search?format=json){:target="_blank"} and in the Final database via the [Final search endpoint](http://localhost:8011/v1/search?format=json){:target="_blank"}.

Pictured here is the Final search endpoint:

![Rest Search]({{site.baseurl}}/images/3x/serve-data/rest-screenshot.png){:.screenshot-border}


## Up Next

[Wrapping Up](../wrapping-up/)
