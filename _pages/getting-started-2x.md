---
layout: inner
title: Getting Started Tutorial 2.x
lead_text: ''
permalink: /
---

<p style="font-style: italic; font-size:12px;">The MarkLogic Data Hub Framework is free and open source under the <a href="https://github.com/marklogic-community/marklogic-data-hub/blob/1.0-master/LICENSE">Apache 2 License</a> and is supported by the community of developers who build and contribute to it. Please note that Data Hub Framework is not a supported MarkLogic product.</p>

__This tutorial is for version 2.x of the Data Hub Framework which works with MarkLogic 9. If you need the 1.x version for MarkLogic 8, go to the [1.x Getting Started Tutorial](/marklogic-data-hub/getting-started-1x)__

## Building an Online Shopping Hub
This tutorial will walk you through setting up a very simple hub for harmonizing online shopping data. Your company sells board games and board game accessories. For some reason you want to load all of your Product and Order into MarkLogic and harmonize it. Our approach will be broken down into five main steps.

1. Load Product data As-Is
1. Harmonize Product data
1. Load Order data As-Is
1. Harmonize Product data
1. Serve the data to downstream clients

### In a Hurry?
The finished version of this tutorial is available for you to download and play with. [Finished Online Shopping Hub Example](https://github.com/marklogic-community/marklogic-data-hub/tree/2.0-develop/examples/online-store){:target="_blank"}

### QuickStart
This tutorial uses QuickStart, a simple User Interface that you can run locally to start working with the Data Hub Framework quickly. With QuickStart you will have a working hub in a matter of minutes. No need to worry about deployment strategies or configuration details. Simply run the QuickStart war (java web archive) and point it at your MarkLogic installation.

## Prerequisites

Before you can run the hub you will need to have some some software installed.

- [Oracle's Java 8](http://www.oracle.com/technetwork/java/javase/downloads/index.html)
- [MarkLogic 9](https://developer.marklogic.com/products)
- A Modern Browser. Chrome or FireFox work best. Use IE at your own risk.

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
1. [Wrapping Up](/marklogic-data-hub/gettings-started-2x/wrapping-up)
