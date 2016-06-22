---
layout: inner
title: Getting Started Tutorial
lead_text: ''
permalink: /
---

## Building an HR Hub
This tutorial will walk you through setting up a very simple hub for HR data. Your company Global Corp has provided you with CSV dumps of 3 tables. Additionally you are receiving JSON data files from a recently acquired company Acme Tech. You are responsible for loading data from both systems into your data hub to make them accessible to internal systems.

### In a Hurry?
The finished version of this tutorial is available for you to download and play with. [Finished HR Hub Example](https://github.com/marklogic/marklogic-data-hub/tree/master/examples/hr-hub){:target="_blank"}

### QuickStart
This tutorial uses quickStart, a simple User Interface that you can run locally to start working with the Data Hub quickly. With QuickStart you will have a working hub in a matter of minutes. No need to worry about deployment strategies or configuration details. Simply run the jar and point it at your MarkLogic installation.


## 1 - Download and Install MarkLogic

Follow the instructions [here](https://docs.marklogic.com/guide/installation){:target="_blank"} for installing MarkLogic.

<iframe width="420" height="315" src="https://www.youtube.com/embed/WaRi9HMtz5Q" frameborder="0" allowfullscreen></iframe>

## 2 - Download the QuickStart Jar

- Create a folder for this hub project and cd into it.

~~~
mkdir data-hub
cd data-hub
~~~
{: .language-bash}

- Download the quick-start-*.jar from the [releases page](https://github.com/marklogic/marklogic-data-hub/releases/latest){:target="_blank"} and place it in the folder you just created.

## 3 - Download the Sample Data

- Create a folder to hold your input data  

~~~
mkdir input
~~~
{: .language-bash}

- Download the [Zip file of sample data]({{site.baseurl}}/data/hr-data.zip){:target="_blank"} into the **input** folder you just created. Now extract it.

Your directory should look like this:

![Directory Tree]({{site.baseurl}}/images/dir-tree.png)

## 4 - Run the QuickStart

- Open a terminal window in the data-hub directory
- Run the Jar

~~~
java -jar quick-start-*.jar
~~~
{: .language-bash}
- Open the QuickStart Application in your browser:
  [http://localhost:8080](http://localhost:8080){:target="_blank"}

## 5 - Login to the Hub

After opening the QuickStart Application you must provide the hostname, admin username, and admin password for your MarkLogic installation. Press the Login Button. The hub will automatically install any necessary modules into your MarkLogic instance.

![Login Screen]({{site.baseurl}}/images/login-screen.png){:height="500px"}

## 6 - Create Your First Entity and Flows

Entities are the business objects that you will be working with in the hub. Start by defining a new Entity for Employees. Click the **New Entity** button. Now fill out the popup with information about your entity. 

You have just created an Entity with some basic Flows.

> **Input Flows** are responsible for getting data into the Hub staging area. 

> **Harmonize Flows** are responsible for batch transformation of data from staging to final.

Next you will want to create an Input and Harmonize flow for Global Corp. Start by clicking the **New** button next to Input Flows. Then fill out the form. Continue by clicking the **New** button next to Harmonize Flows. Then fill out the form.

Now press **Deploy to Server**. You have just deployed your plugins into MarkLogic server. Plugins are the "stored procedures" that make up flows.

![New Entity]({{site.baseurl}}/images/new-employee-entity.gif)

## 7 - Ingest Acme Tech Data

Now that your entity is created you want to ingest some data. QuickStart uses the [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"} to ingest data. Press the **Load Data** button next to the **load-acme-tech** input flow. Point the dialog to the input/AcmeTech directory. Choose the **Documents** Data Format and then press **Submit**.

Behind the scenes QuickStart is running [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp) to ingest the Json documents.

![Run Input Flow]({{site.baseurl}}/images/run-acme-input-flow.gif)

## 8 - Ingest Global Corp Data

Now you need to load the data for Global Corp.

- Press the **Load Data** button next to the **load-global-corp** input flow.
- Point the dialog to the input/GlobalCorp directory.
- Expand the **General Options** section.
- Change **Document Type** to **json**.
- Choose the **Delimited Text** Data Format.
- Expand the **Delimited Text Options** section.
- Check the **Generate URI?** option.
- Press the **Submit** button.

Behind the scenes QuickStart is running [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp) to ingest the CSV data files. During ingest they are converted to JSON because you chose **json** as your Data Format for your flow.

![Run Input Flow]({{site.baseurl}}/images/run-input-flow.gif)

## 9 - Prep for Harmonize

All of our data is loaded into the staging area. While it's possible to harmonize the data right now it's not very useful. The out of the box harmonize plugins will simply copy the staging data to the final data area.

We are going to enhance the data a bit so that it can be more easily searched and accessed. To do this we will identify some commonalities between our two data sets and choose a few fields to extract into the header section of our final envelopes.

For this tutorial we will pull out 3 headers:

- employee id
- hire date
- salary

Because we are dealing with two separate data sources we will put the logic for each source into its own flow.

### Acme Tech Collector

For Acme Tech we want to return a list of URIs. Since the Acme Tech data came to us as JSON documents, there is only one document for every employee.

Use your favorite text editor to open the data-hub/plugins/entities/Employee/harmonize/harmonize-acme-tech/collector/collector.sjs file. Replace its contents with this:

<div class="embed-git" href="//raw.githubusercontent.com/marklogic/marklogic-data-hub/master/examples/hr-hub/plugins/entities/Employee/harmonize/harmonize-acme-tech/collector/collector.sjs"></div>

### Acme Tech header plugin

Use your favorite text editor to open the data-hub/plugins/entities/Employee/harmonize/harmonize-acme-tech/headers/headers.sjs file. Replace its contents with this:

<div class="embed-git" href="//raw.githubusercontent.com/marklogic/marklogic-data-hub/master/examples/hr-hub/plugins/entities/Employee/harmonize/harmonize-acme-tech/headers/headers.sjs"></div>

### Global Corp Collector

The collector is a plugin that provides a list of items to the Harmonize flow to be acted upon. By default the out of the box collector will return all document URIs in the system. We need to change this. For Global Corp we want to return a list of Employee IDs. This allows us to iterate over each employee ID and create an employee document per ID.

Use your favorite text editor to open the data-hub/plugins/entities/Employee/harmonize/harmonize-global-corp/collector/collector.sjs file. Replace its contents with this:

<div class="embed-git" href="//raw.githubusercontent.com/marklogic/marklogic-data-hub/master/examples/hr-hub/plugins/entities/Employee/harmonize/harmonize-global-corp/collector/collector.sjs"></div>

### Global Corp Content Plugin

For Global corp we are going to use the harmonize step to recreate employee records for every employee ID that is in our staging area. Recall that for the collector we are returning employee IDs instead of URIs. Open up your favorite text editor to the data-hub/plugins/entities/Employee/harmonize/harmonize-global-corp/content/content.sjs file. Replace its contents with this:

<div class="embed-git" href="//raw.githubusercontent.com/marklogic/marklogic-data-hub/master/examples/hr-hub/plugins/entities/Employee/harmonize/harmonize-global-corp/content/content.sjs"></div>

### Global Corp Header Plugin

Use your favorite text editor to open the data-hub/plugins/entities/Employee/harmonize/armonize-global-corp/headers/headers.sjs file. Replace its contents with this:

<div class="embed-git" href="//raw.githubusercontent.com/marklogic/marklogic-data-hub/master/examples/hr-hub/plugins/entities/Employee/harmonize/harmonize-global-corp/headers/headers.sjs"></div>

## 10 - Harmonize the data

You ingested your data. You created plugins that will extract common fields into the headers. You edited the collectors to only operate on certain data. Now you are ready to harmonize. Simply press the **Run** button next to both harmonize flows.

![Run Harmonize Flow]({{site.baseurl}}/images/run-harmonize-flow.gif)

## 11 - Consume the Data

Now you can access your data via several REST endpoints. Your harmonized data is available on the Final HTTP server. The defaul port is 8011. A full list of REST endpoints is available here: [https://docs.marklogic.com/REST/client](https://docs.marklogic.com/REST/client){:target="_blank"}

Open the [Staging Search Endpoint](http://localhost:8010/v1/search?format=json){:target="_blank"} against your local instance.

Open the [Final Search Endpoint](http://localhost:8011/v1/search?format=json){:target="_blank"} against your local instance.

*Picture here is the Final Search endpoint.*
![Rest Search]({{site.baseurl}}/images/rest-screenshot.png)

## 12 - Wrapping Up

Congratulations! You just created a Data Hub.

- You loaded JSON and CSV files.
- You harmonized your data by extracting common header fields.
- Your data is now fully accessible via the [MarkLogic REST API](https://docs.marklogic.com/REST/client){:target="_blank"}
