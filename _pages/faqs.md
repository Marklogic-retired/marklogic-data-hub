---
layout: inner
title: Frequently Asked Questions
permalink: /faqs/
---

### The following are frequently asked questions:

1. [What if my question is not answered here?](#what-if-my-question-is-not-answered-here)
1. [How do I deploy my own custom modules?](#how-do-i-deploy-my-own-custom-modules)
1. [Can I change the source or destination database?](#can-i-change-the-source-or-destination-database)
1. [How can I avoid storing passwords in my configuration files?](#how-can-i-avoid-storing-passwords-in-my-configuration-files)
1. [How can I run a harmonize flow immediately for one document?](#how-can-i-run-a-harmonize-flow-immediately-for-one-document)
1. [How do I load binaries via an input flow?](#how-do-i-load-binaries-via-an-input-flow)

<br>

#### What if my question is not answered here?
Use the [#marklogic-dhf tag on StackOverflow](https://stackoverflow.com/questions/ask?tags=marklogic-dhf) to ask us a question.

<br>

#### How do I deploy my own custom modules?
The DHF maps the `plugins` folder to the root of your Modules database. That means that plugins becomes /. Any code modules you place under plugins/ will be deployed into the Modules database.

If you want to deploy custom libraries simply put them under plugins.

<br>

#### Can I change the source or destination database?

Yes. Simply specify **sourceDB** and **finalDB** when [running your flow from Gradle](docs/gradletasks.md#hubrunflow). 

By default the DHF reads from Staging and writes to Final.

<br>

#### How can I avoid storing passwords in my configuration files?
The easiest way to provide authentication information to the Gradle plugin is to set mlUsername and mlPassword in gradle.properties.

If you prefer not to store passwords in plain text in a configuration file you can pass the properties to the command line with the -P flag.

<pre class="cmdline">
gradle someTask -PmlUsername=admin -PmlUsername=admin
</pre>

<br>

#### How can I run a harmonize flow immediately for one document?
See our [Harmonizing via REST page](harmonize/rest.md) for details on how to run a harmonize flow immediately without batching.

<br>

#### How do I load binaries via an input flow?

We have a [code example](https://github.com/marklogic/marklogic-data-hub/tree/master/examples/load-binaries) of doing this. The README file there has all the info you need.
