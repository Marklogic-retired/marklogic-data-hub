---
layout: inner
title: Flow Tracing
lead_text: ''
permalink: /understanding/flowtracing/
---

# Flow Tracing Overview
Flow Tracing produces a detailed view of the flows as they happened. For each plugin in a flow the inputs and outputs to that plugin are recorded into the `Traces` database. Flow Tracing is great for debugging your flows because you can see exactly what came in and went out of each step. You can use Flow Tracing to track down bugs in your flows as well as performance issues.

Flow Tracing can be enabled and disabled as needed. We recommend you disable Flow Tracing in production as there is a performance penalty for writing the additional trace information. Any uncaught exception will always result in a Flow Tracing event, regardless of whether tracing is currently enabled.

Flow Tracing can be viewed with several UIs, described below.

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

![Quickstart enable disable]({{site.baseurl}}/images/traces/FlowTracingEnableDisableViaQuickStart.png)

# Flow Tracing Database
All Flow Tracing events are stored to a separate database created when you initialized your project. By default, the database is called _your-project-name_-TRACING. An Application server is created that is associated with this database, which provides a UI you can use to view the trace events. The default port for this Application server is 8012.

# Viewing Flow Tracing
## Viewing with Quickstart
You can view Flow Tracing events with Quickstart.

From the main Quickstart Dashboard, select Traces.

![Displaying traces Quickstart 1]({{site.baseurl}}/images/traces/DisplayingTracingInQuickstartScreen1.png)

This will show a list of all events currently in the database. Note that you can search the text of the Trace events via the search bar. All text in the trace events is indexed and searchable.

![Displaying traces Quickstart 2]({{site.baseurl}}/images/traces/DisplayingTracingInQuickstartScreen2.png)

Selecting a single trace event will display the detailed flow.

![Displaying single trace Quickstart]({{site.baseurl}}/images/traces/DisplayingSingleTraceInQuickstart.png)

## Viewing with Flow Tracing Viewer
You can also view Flow Tracing events with a Trace Viewer provided in the application server associated with the TRACING database (by default installed on port 8012). This UI is installed into MarkLogic and you do not need a separate tool to view it.

Navigate your browser to the port running the `TRACES` Application server, by default on port 8012. You will be presented with the dedicated Trace Viewer application.

![Displaying all traces dedicated]({{site.baseurl}}/images/traces/DisplayingTracingInDedicatedApp.png)

Selecting a single tracing event will display the detailed flow.

![Displaying single trace dedicated]({{site.baseurl}}/images/traces/DisplayingSingleTraceInDedicatedApp.png)

# Cleaning up Traces
You can delete traces by deleting the job that created them. To do so, go to the Jobs page, click the checkboxes for the Jobs you wish to delete, click `ACTION`, then select "Delete Jobs and Traces". After confirming, the selected jobs and the associated traces will be removed from the Jobs and Traces databases.

![Displaying deletion of a job]({{site.baseurl}}/images/traces/DeleteJobs.png)

# Exporting TRACES
You can export jobs and traces associated with those jobs. Go to the Jobs page, click the checkboxes for the Jobs you wish to export, click `ACTION`, then select "Export Jobs and Traces". After confirming, the selected jobs and their associated traces will be exported to a zip file, which your browser will download. This feature is generally used to help communicate with MarkLogic's Support team. 
