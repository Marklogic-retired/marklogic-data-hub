---
layout: inner
title: Harmonize Using the Gradle Plugin
permalink: /harmonize/gradle/
---

# Harmonize Using the Gradle Plugin

## Creating Entities

Entities are the high-level business objects in your enterprise. They can be things like Employee, Product, Purchase Order, Department, etc. With DHF, you have a choice between using abstract entities or [Entity Services](https://docs.marklogic.com/guide/entity-services/intro).

{% include conrefs/conref-note-gradle-double-quotes.md %}

To create an entity, you simply issue this gradle command:

{% include ostabs.html linux="./gradlew hubCreateEntity -PentityName=MyAwesomeEntity" windows="gradlew.bat hubCreateEntity -PentityName=MyAwesomeEntity" %}

The command creates an entity file (`$project-dir/plugins/entities/MyAwesomeEntity/MyAwesomeEntity.entity.json`), which you can modify to add properties as needed.

## Creating a Harmonize Flow
{% include ostabs.html linux="./gradlew hubCreateHarmonizeFlow -PentityName=MyAwesomeEntity -PflowName=MyHarmonizeFlow" windows="gradlew.bat hubCreateHarmonizeFlow -PentityName=MyAwesomeEntity -PflowName=MyHarmonizeFlow" %}

## Running your Harmonize Flow
{% include ostabs.html linux="./gradlew hubRunFlow -PentityName=MyAwesomeEntity -PflowName=MyHarmonizeFlow -PflowType=harmonize" windows="gradlew.bat hubRunFlow -PentityName=MyAwesomeEntity -PflowName=MyHarmonizeFlow -PflowType=harmonize" %}
