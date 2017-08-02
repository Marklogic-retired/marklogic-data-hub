---
layout: inner
title: Getting Started Tutorial 2.x
lead_text: ''
permalink: /
---

_The MarkLogic Data Hub Framework is free and open source under the [Apache 2 License](https://github.com/marklogic-community/marklogic-data-hub/blob/1.0-master/LICENSE) and is supported by the community of developers who build and contribute to it. Please note that Data Hub Framework is not a supported MarkLogic product._{:.smaller}

__This tutorial is for version 2.x of the Data Hub Framework which works with MarkLogic 9. If you need the 1.x version for MarkLogic 8, go to the [1.x Getting Started Tutorial](/marklogic-data-hub/getting-started-1x)__

## Intro
Before you get started you might want to check out our high level introductions:

- [What is it?](/marklogic-data-hub/what/)
- [How does it work?](/marklogic-data-hub/how/)

## Building an Online Shopping Hub
This tutorial will walk you through setting up a very simple hub for harmonizing online shopping data.

The story is:

> Our company sells board games and board game accessories. We have been tasked with creating a Data Hub on top of MarkLogic. We must load all of our Product and Order data into MarkLogic and harmonize it for use in a new application. Our approach will be broken down into five main steps.

1. Load Product data As-Is
1. Harmonize Product data
1. Load Order data As-Is
1. Harmonize Order data
1. Serve the data to downstream clients

### In a Hurry?
The finished version of this tutorial is available for you to download and play with. [Finished Online Shopping Hub Example](https://github.com/marklogic-community/marklogic-data-hub/tree/2.0-develop/examples/online-store){:target="_blank"}

### QuickStart
This tutorial uses QuickStart, a simple User Interface that you can run locally to start working with the Data Hub Framework quickly. With QuickStart you will have a working hub in a matter of minutes. No need to worry about deployment strategies or configuration details. Simply run the QuickStart war (java web archive) and point it at your MarkLogic installation. _Quickstart is a devops tool. It is meant to be run on your development machine to aid you in quickly deploying your hub._

## Prerequisites

Before you can run the hub, you will need to have some some software installed.

- [Oracle's Java 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html) _(We have not tested with OpenJDK)_{:.smaller}
- [MarkLogic 9](https://developer.marklogic.com/products) _(Installed and initialized)_{:.smaller}
- A Modern Browser. _(Chrome or FireFox work best. Use IE at your own risk.)_{:.smaller}

## Table of Contents
1. [Install the Data Hub Framework](/marklogic-data-hub/getting-started-2x/install)
1. Loading Products
   1. [Create the Product Entity](/marklogic-data-hub/getting-started-2x/create-product-entity)
   1. [Create the Product Input Flow](/marklogic-data-hub/getting-started-2x/create-product-input-flow)
   1. [Load the Product Data As-Is](/marklogic-data-hub/getting-started-2x/load-products-as-is)
1. Harmonizing Products
   1. [Browse and Understand the Product Data](/marklogic-data-hub/getting-started-2x/browse-understand-product-data)
   1. [Modeling the Product Entity](/marklogic-data-hub/getting-started-2x/modeling-product-entity)
   1. [Harmonizing the Product Data](/marklogic-data-hub/getting-started-2x/harmonizing-product-data)
1. Loading Orders
   1. [Create the Order Entity](/marklogic-data-hub/getting-started-2x/create-order-entity)
   1. [Create the Order Input Flow](/marklogic-data-hub/getting-started-2x/create-order-input-flow)
   1. [Load the Orders As-Is](/marklogic-data-hub/getting-started-2x/load-orders-as-is)
1. Harmonizing Orders
   1. [Modeling the Order Entity](/marklogic-data-hub/getting-started-2x/modeling-order-entity)
   1. [Harmonizing the Order Data](/marklogic-data-hub/getting-started-2x/harmonizing-order-data)
1. [Serve the Data Out of MarkLogic](/marklogic-data-hub/getting-started-2x/serve-data)
1. [Wrapping Up](/marklogic-data-hub/getting-started-2x/wrapping-up)
