---
layout: inner
title: DHF QuickStart
permalink: /tools/quickstart/
redirect_from: "/using/quickstart/"
---

# DHF QuickStart

DHF QuickStart is a visual development tool that you can run locally to set up a working data hub in minutes. The tool is implemented as a standalone Java application and distributed as a web application archive (`.war`) file.

This is the recommended tool for users who are new to DHF.

To use DHF QuickStart,
1. [Download the latest `quick-start-*.war` file.](https://github.com/marklogic/marklogic-data-hub/releases/)
1. Run the downloaded file. Example:
    ```
    java -jar quick-start-4.0.3.war
    ```
1. [Create a project using QuickStart](/project/quickstart/) or point to the root directory of an existing project.
1. [Ingest your data using QuickStart.](/ingest/quickstart/)
1. [Harmonize your data using QuickStart.](/harmonize/quickstart/)

{% include note.html type="NOTE" content="QuickStart is intended for the development environment only. For production, use the [DHF Gradle Plugin](/tools/gradle-plugin/) or the [DHF Java Library](/javadocs/)." %}


## See Also
- [DHF Gradle Plugin](/tools/gradle-plugin/)
- [Tutorial on QuickStart](/tutorial/)
- [MarkLogic University courses using QuickStart](https://www.marklogic.com/?s=quickstart)
