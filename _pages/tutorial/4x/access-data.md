---
layout: inner
title: Tutorial - Access the Data from MarkLogic Server
permalink: /tutorial/4x/access-data/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Access the Data from MarkLogic Server

An application can access your harmonized data from MarkLogic Server through several REST endpoints. For a full list of REST endpoints, see [Client API documentation](https://docs.marklogic.com/REST/client){:target="_blank"}.

The following are example searches targeting the default endpoints (port 8010 for the staging database and port 8011 for the final database):

  | database | data | example search links |
  |---|---|---|
  | STAGING  | raw        | [STAGING database search (http://localhost:8010/v1/search?format=json)](http://localhost:8010/v1/search?format=json){:target="_blank"} |
  | FINAL    | harmonized | [FINAL database search (http://localhost:8011/v1/search?format=json)](http://localhost:8011/v1/search?format=json){:target="_blank"}   |
  {:.table-b1gray}

1. Click on the [FINAL database search](http://localhost:8011/v1/search?format=json){:target="_blank"} link.

      An example of results returned:
      ![Rest Search]({{site.baseurl}}/images/3x/serve-data/rest-screenshot.png){:.screenshot-border}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
