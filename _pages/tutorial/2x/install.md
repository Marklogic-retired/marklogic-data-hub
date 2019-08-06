---
layout: inner
title: Getting Started Tutorial 2.x<br>Install the Framework
permalink: /tutorial/2x/install/
---

# Getting Started Tutorial 2.x<br>Install the Framework

## 1 - Download and Install MarkLogic

- Follow the [official instructions](https://docs.marklogic.com/guide/installation){:target="_blank"} for installing MarkLogic.

<iframe width="420" height="315" src="https://www.youtube.com/embed/WaRi9HMtz5Q" frameborder="0" allowfullscreen></iframe>

## 2 - Download the QuickStart War

- Create a folder for this hub project and open a command line window into it. You can create the folder however you like. Here's an example of creating it from the command line.

<pre class="cmdline">
mkdir data-hub
cd data-hub
</pre>

- Download the [Quick Start war](https://github.com/marklogic/marklogic-data-hub/releases/download/v{{ site.data.global.hub_version_2x }}/quick-start-{{ site.data.global.hub_version_2x }}.war) and place it in the folder you just created.

## 3 - Download the Sample Data

- Create a folder to hold your input data

<pre class="cmdline">
mkdir input
</pre>

- Download the [Zip file of sample data]({{site.baseurl}}/data/store-data.zip){:target="_blank"} into the **input** folder you just created. Now extract it.

Your directory should look like this:

<pre class="cmdline">
data-hub
 +-- input
 +-- quick-start-{{ site.data.global.hub_version_2x }}.war
</pre>

## 4 - Run the QuickStart

The QuickStart application is a stand-alone Java Web Application. It runs its own internal web server and serves up the application on port 8080. You do have the option to change the port as noted below. QuickStart can be run on any computer as long as there is network connectivity to your MarkLogic instance. Quickstart will communicate with MarkLogic over http.

Let's run the Quickstart:

1. Open a terminal window in the data-hub directory
1. Run the War

<pre class="cmdline">
java -jar quick-start-{{ site.data.global.hub_version_2x }}.war
</pre>

*If you need to run on a different port then add the --server.port option*

<pre class="cmdline">
java -jar quick-start-{{ site.data.global.hub_version_2x }}.war --server.port=9000
</pre>

![Start QuickStart]({{site.baseurl}}/images/2x/start-quickstart.png)

If you are on Windows you may be presented with a Firewall Notice:
![Firewall notice]({{site.baseurl}}/images/2x/firewall-notice.png)

Click **Allow Access**

- Open the QuickStart Application in your browser:
  [http://localhost:8080](http://localhost:8080){:target="_blank"}

## 5 - Login to the Hub

After opening the QuickStart Application you must step through a wizard to properly configure the Hub.

1. Browse to the directory where your hub lives. If you saved and ran the Quickstart war file in the hub directory, then you should be in the correct directory. <i class="fa fa-hand-pointer-o"></i> Click **Next**{:.blue-button}.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-1.png)

2. Initialize your Data Hub Project Directory. <i class="fa fa-hand-pointer-o"></i> Click **INITIALIZE**{:.blue-button}.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-2.png)

3. You have now initialized your Data Hub Framework project. Your project folder now contains many new files and directories. If you are curious, you can read about the [files in a Data Hub project](https://github.com/marklogic/marklogic-data-hub/wiki/Project-Directory-Structure). <i class="fa fa-hand-pointer-o"></i> Click **Next**{:.blue-button}.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-3.png)

4. Choose the Local Environment. <i class="fa fa-hand-pointer-o"></i> Click **Next**{:.blue-button}.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-4.png)

5. Login to the Hub with your MarkLogic credentials
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-5.png)

6. Install the Hub into MarkLogic. <i class="fa fa-hand-pointer-o"></i> Click **Install**{:.blue-button}. You will then see a screen with progress while the Data Hub is being installed.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-6.png)

Congratulations! The Data Hub Framework is installed and ready to use.
You are taken to the Dashboard page where you can see the document counts of all four hub databases. Additionally, you can clear out the databases one-by-one or in one fell swoop.

The four databases are:

- **Staging**: holds incoming data
- **Final**: holds harmonized data
- **Job**: holds data about the jobs you run
- **Trace**: holds debugging data about each document that has been harmonized

![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-7.png)

## Up Next

[Loading Products > Create the Product Entity]({{site.baseurl}}/tutorial/2x/create-product-entity/)
