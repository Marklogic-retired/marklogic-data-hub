---
layout: inner
title: Frequently Asked Questions
permalink: /faqs/
---

## Frequently Asked Questions:

1. [What if my question is not answered here?](#what-if-my-question-is-not-answered-here)
1. [How do I deploy my own custom modules?](#how-do-i-deploy-my-own-custom-modules)
1. [Can I change the source or destination database?](#can-i-change-the-source-or-destination-database)
1. [How can I avoid storing passwords in my configuration files?](#how-can-i-avoid-storing-passwords-in-my-configuration-files)
1. [How can I run a harmonize flow immediately for one document?](#how-can-i-run-a-harmonize-flow-immediately-for-one-document)
1. [How do I load binaries via an input flow?](#how-do-i-load-binaries-via-an-input-flow)

### What if my question is not answered here?
Use the [#marklogic-dhf tag on StackOverflow](https://stackoverflow.com/questions/ask?tags=marklogic-dhf) to ask us a question.

### What MarkLogic version works with what DHF version?

See [Required Software]({{site.baseurl}}/understanding/upgrading/#required-software).

### How do I deploy my own custom modules?

Place custom modules and libraries in the standard `ml-gradle` location under src/main/ml-config. For more details, see the `ml-gradle` documentation on [Project Layout](https://github.com/marklogic-community/ml-gradle/wiki/Project-layout) and [Common Tasks](https://github.com/marklogic-community/ml-gradle/wiki/Common-tasks#).

### Can I change the source or destination database?

Yes. Simply specify **sourceDB** and **finalDB** when [running your flow from Gradle](docs/gradletasks.md#hubrunflow).

By default the DHF reads from Staging and writes to Final.

### How can I avoid storing passwords in my configuration files?
The easiest way to provide authentication information to the Gradle plugin is to set mlUsername and mlPassword in gradle.properties.

If you prefer not to store passwords in plain text in a configuration file you can pass the properties to the command line with the -P flag.

<pre class="cmdline">
gradle someTask -PmlUsername=admin -PmlUsername=admin
</pre>

### How can I run a harmonize flow immediately for one document?
See our [Harmonizing via REST page](harmonize/rest.md) for details on how to run a harmonize flow immediately without batching.

### How do I load binaries via an input flow?

We have a [code example](https://github.com/marklogic/marklogic-data-hub/tree/master/examples/load-binaries) of doing this. The README file there has all the info you need.

#### How can I run DHF in the MarkLogic DHS

DHF is part of the suite of data services that make up Data Hub as a Service.  Using DHF within DHS requires that you no longer rely on bootstrapping or database configuration.  This means that your `gradle.properties` file must:

* Have mlUsername/mlPassword provided to you by your DHS administrator
* Include the following in order for the DHS-provisioned roles to access artifacts created by flows or by DHF development tasks.

```
mlModulePermissions=flowDeveloper,read,flowDeveloper,execute,flowDeveloper,insert,flowOperator,read,flowOperator,execute,flowOperator,insert
```




