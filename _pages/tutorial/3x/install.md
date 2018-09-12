---
layout: inner
title: Getting Started Tutorial 3.x<br>Install the Data Hub Framework
lead_text: ''
permalink: /tutorial/install/
---

## 1. Download the QuickStart .war

Create a folder for this hub project and open a command line window into it. You can create the folder however you like. Here's an example of creating it from the command line.

<pre class="cmdline">
mkdir data-hub
cd data-hub
</pre>

Download the latest [QuickStart .war](https://github.com/marklogic/marklogic-data-hub/releases/download/v{{ site.data.global.hub_version }}/quick-start-{{ site.data.global.hub_version }}.war) and place it in the folder you just created.

## 2. Download the Sample Data

Create a folder to hold your input data  

<pre class="cmdline">
mkdir input
</pre>

Download the [.zip file of sample data]({{site.baseurl}}/data/store-data.zip){:target="_blank"}.

Open the .zip file and move the subfolders of sample data (campaigns/, customers/, etc.) into the **input** folder you just created.

Your project folder should look like this:

<pre class="cmdline">
data-hub
 +-- input  
 +-- quick-start-{{ site.data.global.hub_version }}.war
</pre>

## 3. Run QuickStart

The QuickStart application is a stand-alone Java Web Application. It runs its own internal web server and serves up the application on port 8080. You do have the option to change the port as noted below. QuickStart can be run on any computer as long as there is network connectivity to your MarkLogic instance. QuickStart will communicate with MarkLogic over HTTP.

To run QuickStart, open a terminal window in the data-hub directory and run the .war:

<pre class="cmdline">
java -jar quick-start-{{ site.data.global.hub_version }}.war
</pre>

If you need to run on a different port then add the --server.port option:

<pre class="cmdline">
java -jar quick-start-{{ site.data.global.hub_version }}.war --server.port=9000
</pre>

After running the .war, should see the following in the terminal:

![Start QuickStart]({{site.baseurl}}/images/3x/install/start-quickstart.png)

If you are on Windows you may be presented with a firewall alert:

![Firewall notice]({{site.baseurl}}/images/3x/install/firewall-notice.png)

Click **Allow access**

With the QuickStart application running, open it in your browser: [http://localhost:8080](http://localhost:8080){:target="_blank"}

## 4. Install the Data Hub

After opening the QuickStart application, you must step through a sequence of screens to properly configure and install the hub.

1. Browse to the directory where your hub lives. If you saved and ran the Quickstart war file in the hub directory, then you should be in the correct directory. Click **NEXT**.
<br/>![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-1.png){:.screenshot}

2. Click **INITIALIZE** to initialized your project directory.
<br/>![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-2.png){:.screenshot}

3. You have now initialized your Data Hub Framework project. Your project folder now contains many new files and directories. If you are curious, you can read about the [files in a Data Hub Framework project](https://github.com/marklogic-community/marklogic-data-hub/wiki/Project-Directory-Structure). Click **NEXT**.
<br/>![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-3.png){:.screenshot}

4. Choose the local environment, then click **NEXT**.
<br/>![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-4.png){:.screenshot}

5. Enter your MarkLogic credentials, then click **LOGIN**.
<br/>![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-5.png){:.screenshot}

6. Click **INSTALL** to install the data hub into MarkLogic. You will see a screen with progress information while the data hub is being installed.
<br/>![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-6.png){:.screenshot}

Congratulations! The Data Hub Framework is installed and ready to use.
You are taken to the Dashboard page where you can see the document counts of all three hub databases. Additionally, you can clear out the databases one at a time or all in one fell swoop.

The following are the three databases and what they store:

- **Staging**: incoming data
- **Final**: harmonized data
- **Jobs**: data about the jobs run and tracing data about each harmonized document

![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-7.png)

## Up Next

[Create the Product Entity](../create-product-entity/)
