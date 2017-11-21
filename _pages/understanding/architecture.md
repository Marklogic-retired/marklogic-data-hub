---
layout: inner
title: Data Hub Framework Architecture
permalink: /understanding/architecture/
---

# At a Glance
The Data Hub Framework (DHF) consists of three tools:
1. [QuickStart User Interface](#quickstart-user-interface)
1. [Gradle plugin: ml-data-hub](#gradle-plugin-ml-data-hub)
1. [DHF Java library](#dhf-java-library)

### Which one should I use?

**Just Getting Started** - If you are brand new to the DHF then we recommend you start with the QuickStart UI. This is the easiest way to get up and running because you don't need to install dependencies (except for an Oracle Java 8 runtime).

**Command Line Ninjas** - If you fancy yourself a command line ninja then you may want to start with the ml-data-hub Gradle plugin. This approach is the second easiest approach and you can be up and running in seconds if you already have gradle installed.

**Production and Beyond** - If you are running in production then you will definitely want to be using the ml-data-hub Gradle plugin or the Jar file via your own custom Java code. You may still use the Quickstart for development tasks, but to run your harmonize flows you will want to go ninja.

### QuickStart User Interface
The Quickstart UI is a visual development tool. It's great for showing off the DHF functionality. The QuickStart is meant for development and not for running in production. Think of it as a code editor and scaffold generator, not something that runs your enterprise. QuickStart is the easiest way to get started using the DHF.

### Gradle Plugin: ml-data-hub
This Gradle plugin allows you to interact with the DHF Java Library from a command line. The plugin runs inside of Gradle and inherits functionality from the ml-gradle project.

Everything you need to do with the DHF you can do via the ml-data-hub gradle plugin.

### DHF Java Library
The Data Hub Framework Java Library is the core of the DHF. This library handles the MarkLogic setup and deploy as well as the running of Harmonization flows.
