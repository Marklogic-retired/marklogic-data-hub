---
layout: inner
title: Frequently Asked Questions
permalink: /faqs/
---

### These are our most frequently asked questions.

1. [My Question is not answered here](#my-question-is-not-answered-here)
1. [How Do I deploy my own custom modules?](#how-do-i-deploy-my-own-custom-modules)
1. [Can I Change the Source or Destination Database?](#can-i-change-the-source-or-destination-database)
1. [How can I avoid storing passwords in my configuration files?](#how-can-i-avoid-storing-passwords-in-my-configuration-files)
1. [How Can I run a Harmonize Flow immediately for 1 document?](#how-can-i-run-a-harmonize-flow-immediately-for-1-document)
1. [How do I load binaries via an Input Flow?](#how-do-i-load-binaries-via-an-input-flow)

<br>

#### My Question is not answered here
Use the [#marklogic-dhf tag on StackOverflow](https://stackoverflow.com/questions/ask?tags=marklogic-dhf) to ask us a question.

<br>

#### How Do I deploy my own custom modules?
The DHF maps the `plugins` folder to the root of your Modules database. That means that plugins becomes /. Any code modules you place under plugins/ will be deployed into the Modules Database.

If you want to deploy custom libraries simply put them under plugins.

<br>

#### Can I Change the Source or Destination Database?
By default the DHF reads from Staging and writes to Final. Can I change that up?

YES! Simply specify **sourceDB** and **finalDB** when [running your flow from Gradle](docs/gradletasks.md#hubrunflow).

<br>

#### How can I avoid storing passwords in my configuration files?
The easiest way to provide authentication information to the gradle plugin is to set mlUsername and mlPassword in gradle.properties.

If you prefer not to store passwords in plain text in a configuration file you can pass the properties to the command line with the -P flag.

<pre class="cmdline">
gradle someTask -PmlUsername=admin -PmlUsername=admin
</pre>

See [ml-gradle issue #171](https://github.com/marklogic/ml-gradle/issues/171) for more details.

<br>

#### How Can I run a Harmonize Flow immediately for 1 document?
See our [Harmonize via REST page](harmonize/rest.md) for details on how to run a Harmonize Flow immediately without batching.

<br>

#### How do I load binaries via an Input Flow?

We have a [code example](https://github.com/marklogic/marklogic-data-hub/tree/master/examples/load-binaries) of doing this. The README file there has all the info you need.
