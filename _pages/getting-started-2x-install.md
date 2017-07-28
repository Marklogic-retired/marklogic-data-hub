---
layout: inner
title: Getting Started Tutorial 2.x<br>Install the Framework
lead_text: ''
permalink: /getting-started-2x/install
---

## 1 - Download and Install MarkLogic

Follow the [official instructions](https://docs.marklogic.com/guide/installation){:target="_blank"} for installing MarkLogic.

<iframe width="420" height="315" src="https://www.youtube.com/embed/WaRi9HMtz5Q" frameborder="0" allowfullscreen></iframe>

## 2 - Download the QuickStart War

- Create a folder for this hub project and cd into it.

~~~
mkdir data-hub
cd data-hub
~~~
{: .language-bash}

- Download the latest Quick Start 2.x quick-start-2*.war from the [releases page](https://github.com/marklogic-community/marklogic-data-hub/releases){:target="_blank"} and place it in the folder you just created. **Be sure you are getting the latest 2.x version and not the 1.x version!**

## 3 - Download the Sample Data

- Create a folder to hold your input data  

~~~
mkdir input
~~~
{: .language-bash}

- Download the [Zip file of sample data]({{site.baseurl}}/data/store-data.zip){:target="_blank"} into the **input** folder you just created. Now extract it.

Your directory should look like this:

![Directory Tree]({{site.baseurl}}/images/2x/dir-tree.png)

## 4 - Run the QuickStart

1. Open a terminal window in the data-hub directory
1. Run the War

~~~
java -jar quick-start-*.war
~~~
{: .language-bash}

*If you need to run on a different port then add the --server.port option*

~~~
java -jar quick-start-*.war --server.port=9000
~~~
{: .language-bash}

![Start QuickStart]({{site.baseurl}}/images/2x/start-quickstart.png)

- Open the QuickStart Application in your browser:
  [http://localhost:8080](http://localhost:8080){:target="_blank"}

## 5 - Login to the Hub

After opening the QuickStart Application you must step through a wizard to properly configure the Hub.

1. Browse to the directory where your hub where live.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-1.png)

2. Initialize your Data Hub Project Directory.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-2.png)

3. <i class="fa fa-hand-pointer-o"></i> Click Next.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-3.png)

4. Choose the Local Environment.
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-4.png)

5. Login to the Hub with your MarkLogic credentials
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-5.png)

6. Install the Hub into MarkLogic
![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-6.png)

Congratulations! The Data Hub Framework is installed and ready to use.
You are taken to the Dashboard page where you can see the document counts of all four hub databases. Additionally, you can clear out the databases one-by-one or in one fell swoop.

![Hub Directory]({{site.baseurl}}/images/2x/hub-wizard-7.png)

## Up Next

[Loading Products > Create the Product Entity](/marklogic-data-hub/getting-started-2x/create-product-entity)
