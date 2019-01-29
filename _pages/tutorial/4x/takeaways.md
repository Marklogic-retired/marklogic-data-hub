---
layout: inner
title: Tutorial - Takeaways
permalink: /tutorial/4x/takeaways/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Takeaways

In this tutorial, you learned the full process of ingesting and harmonizing data from your source datasets into a data hub in the MarkLogic Server with variations in handling more complex data and personally identifiable information (PII).

**QuickStart is intended for use in a development environment only.** For production, use MLCP or other tools for input flows and gradle tasks or your own code (using the provided [Java classes]({{site.baseurl}}/harmonize/java/)) for harmonization flows. See [DHF Tools]({{site.baseurl}}/tools/).


## Clean Up

To delete one or more databases created by this tutorial,
1. In QuickStart's navigation bar, click **Dashboard**{:.uimenuitem}.
2. In the **Databases**{:.uilabel} section, click the trash icon for the database you want to delete.
3. To delete all database, click the skull icon at the top right of the **Databases**{:.uilabel} section.
{:.ol-steps}

To delete the entire data hub created by this tutorial and to uninstall DHF,
1. In QuickStart's navigation bar, click **Settings**{:.uimenuitem}.
1. Select **Uninstall Hub**{:.uilabel}.
{:.ol-steps}


## Additional Resources

- [MarkLogic University](https://mlu.marklogic.com/ondemand/index.xqy?q=Series%3A%22Operational%20Data%20Hubs%22): Data Hub Framework On Demand Video Courses
- [Data Hub Framework Examples](https://github.com/marklogic/marklogic-data-hub/tree/develop/examples): Many examples of how to use the Data Hub Framework

**Questions:** Use the [#marklogic-dhf tag on StackOverflow](https://stackoverflow.com/questions/ask?tags=marklogic-dhf).

**Comments/Bugs:** [File an issue on Github](https://github.com/marklogic/marklogic-data-hub/issues/new).


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
