---
layout: inner
title: Tutorial - View the Jobs Log
permalink: /tutorial/4x/view-jobs/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: View the Jobs Log

We use the QuickStart Jobs viewer to view the results of the jobs we just ran.

{% include conrefs/conref-qs-4x-jobs.md imgpath=var-imgpath pickitem="the job for the input flow `Load Products`" fullsteps=true %}

### Result

If an input flow completed successfully, the report would show:
- `OUTPUT_RECORDS_FAILED: 0`
- the same value for both `INPUT_RECORDS` and `OUTPUT_RECORDS`

  {% assign full-imgpath=var-imgpath | append: "qs-4x-jobs-job-output-Product.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="Job Output" imgclass="img-results" tab="  " %}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
