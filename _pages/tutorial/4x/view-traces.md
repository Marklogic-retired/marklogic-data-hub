---
layout: inner
title: Tutorial - View the Traces Log
permalink: /tutorial/4x/view-traces/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: View the Traces Log

We will view the trace log for one dataset item in the one of our input flow jobs.

{% include conrefs/conref-qs-4x-traces.md imgpath=var-imgpath %}


### Extra Credit

**Question:** Which input flow plugin displays a third type of trace, besides input and output?

  {% assign full-imgpath=var-imgpath | append: "qs-4x-traces-triples.png" %}
  <details><summary><i>Answer</i></summary>
    The triples plugin.<br/>
    <img src="{{ full-imgpath }}" class="img-50"/>
  </details>


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
