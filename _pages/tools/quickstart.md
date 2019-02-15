---
layout: inner
title: DHF QuickStart
permalink: /tools/quickstart/
redirect_from: "/using/quickstart/"
---

# DHF QuickStart

DHF QuickStart is a visual development tool that you can run locally to set up a working data hub in minutes. The tool is implemented as a standalone Java application and distributed as a web application archive (`.war`) file.

QuickStart runs its own internal web server on port 8080. It can run on any computer that can access a MarkLogic Server instance via HTTP.

<!-- To use a different port, .... -->


This is the recommended tool for users who are new to DHF.

To use DHF QuickStart,
1. [Download the latest `quick-start-*.war` file](https://github.com/marklogic/marklogic-data-hub/releases/) and place it your project root directory.
1. Run the downloaded file. Example:
    ```
    java -jar quick-start-{{ site.data.global.hub_version }}.war
    ```
1. [Create a project using QuickStart]({{site.baseurl}}/project/quickstart/) or browse to an existing project's root directory.
1. [Ingest your data using QuickStart.]({{site.baseurl}}/ingest/quickstart/)
1. [Harmonize your data using QuickStart.]({{site.baseurl}}/harmonize/quickstart/)

You can also:
- [Track the jobs that are performed on your data hub.]({{site.baseurl}}/maintain/jobs-traces/)

QuickStart is intended for the development environment only. For production, use the DHF Gradle Plugin or the DHF Java Library.


## See Also
- [DHF Gradle Plugin]({{site.baseurl}}/tools/gradle-plugin/)
- [DHF Java Library]({{site.baseurl}}/javadocs/)
- [Tutorial on QuickStart]({{site.baseurl}}/tutorial/)
- [MarkLogic University courses using QuickStart](https://www.marklogic.com/?s=quickstart)
