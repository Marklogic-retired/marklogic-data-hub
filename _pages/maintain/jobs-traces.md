---
layout: inner
title: Jobs and Traces
permalink: /maintain/jobs-traces/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Jobs and Traces

MarkLogic tracks:
- the jobs that are performed on your data hub (**Jobs**{:.uilabel})
- the inputs into and outputs from each plugin that runs during a flow (**Traces**{:.uilabel})

These **Jobs**{:.uilabel} and **Traces**{:.uilabel} logs can help troubleshoot errors in your flows.


## View Job Results
{% include conrefs/conref-qs-4x-jobs.md imgpath=var-imgpath pickitem="any job" fullsteps=true %}


## View Traces
{% include conrefs/conref-qs-4x-traces.md imgpath=var-imgpath %}


<!--
## Export Jobs and Traces
## Delete Jobs and Traces
-->