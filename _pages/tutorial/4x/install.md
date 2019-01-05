---
layout: inner
title: Tutorial - Install the Data Hub Framework
permalink: /tutorial/4x/install/
---

# Tutorial: Install the Data Hub Framework


## 1 - Set Up the Project Directory and Sample Data

1. Create a directory called `data-hub`. This directory will be referred to as "your project root" or simply "root".
1. {% include conrefs/conref-qs-download.md warver=site.data.global.hub_version_4x %}
1. Under your project root, create a directory called `input`.
1. Download the [sample data .zip file]({{site.baseurl}}/data/store-data.zip){:target="_blank"}. Expand it, as needed.
1. Copy the subdirectories (e.g., `campaigns`, `customers`, `orders`) inside the sample data .zip file into the `input` directory.
{:.ol-steps}

**Result**

Your project directory structure will be as follows:

<pre class="dirtree">
  data-hub
  ├─ quick-start-{{ site.data.global.hub_version_4x }}.war
  └─ input
     ├─ campaigns
     ├─ customers
     ├─ issuehistories
     ├─ ...
     └─ supportcustomers
</pre>


## 2 - Start QuickStart

1. At a command-line window, run the QuickStart .war.
  - To use the default port number for the internal web server (port 8080):

        ```
        java -jar quick-start-{{ site.data.global.hub_version_4x }}.war
        ```

  - To use a custom port number; e.g., port 9000:

        ```
        java -jar quick-start-{{ site.data.global.hub_version_4x }}.war --server.port=9000
        ```
  {:.ol-substeps}

  {% include note-in-list.html type="NOTE" content="If you are using Windows and a firewall alert appears, click `Allow access`." %}

  **Result**

  ![QuickStart initialization]({{site.baseurl}}/images/3x/install/start-quickstart.png)

1. In a web browser, navigate to [`http://localhost:8080`](http://localhost:8080){:target="_blank"} to open the QuickStart UI.
{:.ol-steps}


## 3 - Install the Data Hub

In the QuickStart UI,

1. Browse to your project root directory. Click **NEXT**.
<br/>![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-1.png){:.screenshot}

2. Click **INITIALIZE** to initialize your project directory.
<br/>![Hub Directory]({{site.baseurl}}/images/3x/install/hub-wizard-2.png){:.screenshot}

3. You have now initialized your Data Hub Framework project. Your project directory now contains many new files and directories. If you are curious, you can read about the [files in a Data Hub Framework project](https://github.com/marklogic-community/marklogic-data-hub/wiki/Project-Directory-Structure). Click **NEXT**.
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


{% include prev-next-nav.html
  prevtext="Overview"
  prevlink="/tutorial/4x/"
  increl="tutorial-toc.md"
  nexttext="Create the Product Entity"
  nextlink="/tutorial/4x/create-product-entity/"
%}
