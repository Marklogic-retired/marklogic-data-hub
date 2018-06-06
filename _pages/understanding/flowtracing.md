---
layout: inner
title: Flow Tracing
lead_text: ''
permalink: /understanding/flowtracing/
---

<!--- DHFPROD-646 TODO since this is primarily a debugging thing, does it make more sense under Using the DHF than under Concepts? -->

Flow tracing produces a detailed view of the flows as they happened. For each plugin in a flow, the inputs and outputs to that plugin are recorded into the JOBS database. Flow tracing is great for debugging your flows because you can see exactly what came in and went out of each step. You can use flow tracing to track down bugs in your flows as well as performance issues.

Flow tracing can be enabled and disabled as needed. We recommend you disable flow tracing in production as there is a performance penalty for writing the additional trace information. Any uncaught exception will always result in a flow tracing event, regardless of whether tracing is currently enabled.

Flow tracing can be viewed with several UIs, described below.

## Controlling Flow Tracing Events
A flag in the Modules database controls whether flow tracing is turned on. There are two ways to enable and disable flow tracing: using a gradle task, or via the QuickStart UI.

### Enabling and Disabling via Gradle
In the directory where the project framework code lives, run these commands to enable/disable flow tracing:

#### Enable
{% include ostabs.html linux="./gradlew hubEnableTracing" windows="gradlew.bat hubEnableTracing" %}

#### Disable
{% include ostabs.html linux="./gradlew hubDisableTracing" windows="gradlew.bat hubDisableTracing" %}

### Enabling and Disabling via the Quickstart UI
Navigate to the Settings screen in QuickStart. On that page, you will find a selector to enable and disable flow tracing.

![Quickstart enable disable]({{site.baseurl}}/images/traces/FlowTracingEnableDisableViaQuickStart.png)

## Flow Tracing Database
All flow tracing events are stored in the separate JOBS database that is created when you initialize a project. By default, the database is called _your-project-name_-JOBS. An application server is created that is associated with this database, which provides a UI you can use to view the trace events. The default port for this application server is 8013.

## Viewing Flow Tracing
You can view flow tracing events in the following ways:
* Using QuickStart 
* Using the Trace Viewer, a standalone application.

### Viewing with QuickStart
You can view flow tracing events with QuickStart.

From the main QuickStart dashboard, select Traces.

![Displaying traces Quickstart 1]({{site.baseurl}}/images/traces/DisplayingTracingInQuickstartScreen1.png)

This will show a list of all events currently in the database. Note that you can search the text of the trace events via the search bar. All text in the trace events is indexed and searchable.

![Displaying traces Quickstart 2]({{site.baseurl}}/images/traces/DisplayingTracingInQuickstartScreen2.png)

Selecting a single trace event will display the detailed flow.

![Displaying single trace Quickstart]({{site.baseurl}}/images/traces/DisplayingSingleTraceInQuickstart.png)

### Viewing with the Trace Viewer
You can also view flow tracing events with a Trace Viewer provided in the application server associated with the JOBS database (by default installed on port 8013). This UI is installed into MarkLogic and you do not need a separate tool to view it.

Navigate your browser to the port running the `TRACES` application server, by default on port 8013. You will be presented with the dedicated Trace Viewer application.

![Displaying all traces dedicated]({{site.baseurl}}/images/traces/DisplayingTracingInDedicatedApp.png)

Selecting a single tracing event will display the detailed flow.

![Displaying single trace dedicated]({{site.baseurl}}/images/traces/DisplayingSingleTraceInDedicatedApp.png)

## Cleaning up Traces
You can delete traces by deleting the job that created them. To do so, go to the Jobs page, click the checkboxes for the jobs you wish to delete, click `ACTION`, then select "Delete Jobs and Traces". After confirming, the selected jobs and the associated traces will be removed from the JOBS databases.

![Displaying deletion of a job]({{site.baseurl}}/images/traces/DeleteJobs.png)

## Exporting Traces
You can export jobs and traces associated with those jobs. Go to the Jobs page, click the checkboxes for the Jobs you wish to export, click `ACTION`, then select "Export Jobs and Traces". After confirming, the selected jobs and their associated traces will be exported to a zip file, which your browser will download. This feature is generally used to help communicate with MarkLogic's support team. 
