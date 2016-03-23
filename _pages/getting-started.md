---
layout: inner
title: Getting Started
lead_text: ''
permalink: /getting-started/
---

# Install MarkLogic

Follow the instructions [here](http://docs.marklogic.com/guide/installation) for installing MarkLogic.

# Run the QuickStart

Want to get up and running quickly? Try the quick-start jar.

- Download the jar from the [releases page](https://github.com/marklogic/marklogic-data-hub/releases/latest).
- Run the Jar
  `java -jar quick-start-1.0.0-alpha.1.jar`
- Open the Quickstart Application in your browser:
  http://localhost:8080


<script type="text/javascript" src="https://asciinema.org/a/efos1i49du6shiilfwsxu73gl.js" id="asciicast-efos1i49du6shiilfwsxu73gl" async></script>

# Install the Hub

After opening the [QuickStart UI](http://localhost:8080) provide the hostname, username, and password for your MarkLogic installation. Press the Login Button. The hub will automatically install into your MarkLogic instance.

# Create an Entity

Entities are the business objects that you will be working with in the hub. Start by defining a new Entity. Click the "New Entity" button. Now fill out the popup with information about your entity.

# Ingest Data

Now that your entity is created you want to ingest some data.

# Conform the Data

You have ingested some data. Now it's time to conform.

# Consume the Data

Now you can access your data via several REST endpoints. Your conformed data is available on the Final HTTP server. The defaul port is 8011. A full list of REST endpoints is available here: [http://docs.marklogic.com/REST/client](http://docs.marklogic.com/REST/client)
