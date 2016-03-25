---
layout: inner
title: Getting Started
lead_text: ''
permalink: /getting-started/
---

# QuickStart

QuickStart is a Spring Boot Java application that you can run locally to get up and running with the Data Hub quickly. With QuickStart you will have a working hub in a matter of minutes. No need to worry about deployment strategies or configuration details. Simply run the jar and point it at your MarkLogic installation.

<div class="jumbotron" markdown="1">
**\*QuickStart is not meant for production applications. We assume that you are running QuickStart on your local host.**
</div>

## QuickStart Architecture
![QuickStart Architecture](https://raw.githubusercontent.com/marklogic/marklogic-data-hub/design/images/quickstart-architecture-gray.png)

# Tutorial
This tutorial will walk you through setting up a very simple hub that ingests Tweets as JSON data.

## 1 - Download and Install MarkLogic

Follow the instructions [here](http://docs.marklogic.com/guide/installation){:target="_blank"}{:target="_blank"} for installing MarkLogic.

<iframe width="420" height="315" src="https://www.youtube.com/embed/WaRi9HMtz5Q" frameborder="0" allowfullscreen></iframe>

## 2 - Download the QuickStart Jar

- Create a folder for this hub project and cd into it.

~~~
mkdir data-hub
cd data-hub
~~~
{: .language-bash}

- Download the quick-start-*.jar from the [releases page](https://github.com/marklogic/marklogic-data-hub/releases/latest){:target="_blank"} and place it in the folder you just created.
- Create a folder to hold your input data  
`mkdir input`
- Download the [Tweets sample data](https://github.com/marklogic/marklogic-data-hub/raw/master/examples/tweets/input/tweets.zip){:target="_blank"} into the **input** folder you just created.

## 3 - Run the QuickStart

- Run the Jar
  `java -jar quick-start-1.0.0-alpha.1.jar`
- Open the QuickStart Application in your browser:
  [http://localhost:8080](http://localhost:8080){:target="_blank"}

## 4 - Install the Hub

After opening the [QuickStart UI](http://localhost:8080){:target="_blank"} provide the hostname, username, and password for your MarkLogic installation. Press the Login Button. The hub will automatically install into your MarkLogic instance.

![Login Screen](../images/login-screen.png)

## 5 - Create Your First Entity

Entities are the business objects that you will be working with in the hub. Start by defining a new Entity for Tweets. Click the **New Entity** button. Now fill out the popup with information about your entity. Then press **Deploy to Server**.

![New Entity](../images/new-tweet-entity.gif)

## 6 - Ingest Data

Now that your entity is created you want to ingest some data. QuickStart uses the [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"} to ingest data. Press the **Load Data** button next to an input flow. Point the dialog to a directory containing your files. Choose the appropriate file type from the dropdown then press Submit.

![Run Input Flow](../images/run-input-flow.gif)

## 7 - Conform the Data

You have ingested some data. Now it's time to conform. To conform data simply run a Conformance flow. Press the **Run** button next to a conformance flow.

![Run Conform Flow](../images/run-conform-flow.gif)

## 8 - Consume the Data

Now you can access your data via several REST endpoints. Your conformed data is available on the Final HTTP server. The defaul port is 8011. A full list of REST endpoints is available here: [http://docs.marklogic.com/REST/client](http://docs.marklogic.com/REST/client){:target="_blank"}

![Rest Search](../images/rest-screenshot.png)
