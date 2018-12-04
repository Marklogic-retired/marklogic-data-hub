---
layout: inner
title: Harmonize Using the Gradle Plugin
permalink: /harmonize/gradle/
---

# Harmonize Using the Gradle Plugin

## Creating Entities

Entities are the high-level business objects in your enterprise. They can be things like Employee, Product, Purchase Order, Department, etc. With DHF, you have a choice between using abstract entities or [Entity Services](https://docs.marklogic.com/guide/entity-services/intro).

To create an entity, you simply issue this gradle command:

{% include ostabs.html linux="./gradlew hubCreateEntity -PEntityName=\"My Awesome Entity\"" windows="gradlew.bat hubCreateEntity -PEntityName=\"My Awesome Entity\"" %}

The command will generate an empty directory: `$project-dir/plugins/entities/My Awesome Entity`

## Creating a Harmonize Flow
{% include ostabs.html linux="./gradlew hubCreateHarmonizeFlow -PentityName=\"My Awesome Entity\" -PflowName=\"My Harmonize Flow\"" windows="gradlew.bat hubCreateHarmonizeFlow -PentityName=\"My Awesome Entity\" -PflowName=\"My Harmonize Flow\"" %}

## Running your Harmonize Flow
{% include ostabs.html linux="./gradlew hubRunFlow -PentityName=\"My Awesome Entity\" -PflowName=\"My Harmonize Flow\" -PflowType=\"harmonize\"" windows="gradlew.bat hubRunFlow -PentityName=\"My Awesome Entity\" -PflowName=\"My Harmonize Flow\" -PflowType=\"harmonize\"" %}
