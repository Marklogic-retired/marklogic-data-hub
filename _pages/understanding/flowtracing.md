---
layout: inner
title: Flow Tracing
lead_text: ''
permalink: /understanding/flowtracing/
---

# Flow Tracing Overview
Flow Tracing produces a detailed view of the flows as they happened. All Flow Tracing events are recorded in the `TRACES` database and can be viewed with several UIs, described below. Flow Tracing can be enabled and disabled as needed. Any uncaught exception will always result in a Flow Tracing event, regardless of whether tracing is currently enabled.

# Controlling Flow Tracing Events
A flag in the Modules database controls whether flow tracing is turned on. There are two ways to enable and disable Flow Tracing: using a gradle task, or via the Quickstart UI.

## Enabling and Disabling via Gradle
In the directory where the project framework code lives, run these commands to enable/disable flow tracing:

### Enable
{% include ostabs.html linux="./gradlew hubEnableTracing" windows="gradlew.bat hubEnableTracing" %}

### Disable:
{% include ostabs.html linux="./gradlew hubDisableTracing" windows="gradlew.bat hubDisableTracing" %}

## Enabling and Disabling via the Quickstart UI
Navigate to the Settings screen in Quickstart. On that page, you will find a selector to enable and disable Flow Tracing.

![Quickstart enable disable]({{site.baseurl}}/images/traces/FowTracingEnableDisableViaQuickStart.png)

# Flow Tracing Database
All Flow Tracing events are stored to a separate database created when you initialized your project. By default, the database is called _your-project-name_-TRACING. An Application server is created that is associated with this database, which provides a UI you can use to view the trace events. The default port for this Application server is 8012.

# Viewing Flow Tracing
## Viewing with Quickstart
You can view Flow Tracing events with Quickstart.

From the main Quickstart Dashboard, select Traces.

![Displaying traces Quickstart 1]({{site.baseurl}}/images/traces/DisplayingTracingInQuickstartScreen1.png)

This will show a list of all events currently in the database.

![Displaying traces Quickstart 2]({{site.baseurl}}/images/traces/DisplayingTracingInQuickstartScreen2.png)

Selecting a single trace event will display the detailed flow.

![Displaying single trace Quickstart]({{site.baseurl}}/images/traces/DisplayingSingleTraceInQuickstart.png)

## Viewing with Flow Tracing Viewer
You can also view Flow Tracing events with a Trace Viewer provided in the application server associated with the TRACING database (by default installed on port 8012).

Navigate your browser to the port running the `TRACES` Application server, by default on port 8012. You will be presented with the dedicated Trace Viewer application.

![Displaying all traces dedicated]({{site.baseurl}}/images/traces/DisplayingTracingInDedicatedApp.png)

Selecting a single tracing event will display the detailed flow.

![Displaying single trace dedicated]({{site.baseurl}}/images/traces/DisplayingSingleTraceInDedicatedApp.png)
