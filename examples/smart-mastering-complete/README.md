This project provides examples of various mastering features in DHF. 

## How to install

To try this project out using QuickStart, start with a clean MarkLogic instance - i.e. without an existing Data hub installation.
Then, you can either install this project's application via QuickStart or via Gradle.

### Install via QuickStart

To install via QuickStart, simply start QuickStart and browse to this project folder. Use QuickStart to initialize
this project and then deploy the application.

### Install via Gradle

To install via Gradle, first initialize the project:

    ./gradlew -i hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 

Then deploy the application:

    ./gradlew -i mlDeploy

Next, start up QuickStart and browse to this project folder and login to QuickStart. 

## How to run the flow

You can then run the "persons" flow to ingest, map, and master the person documents found in the ./data/persons directory.  

Before running the flow, you may want to turn on the "SM-MATCH" trace event in MarkLogic to see some logging for each 
match that the mastering step makes. You can do this via the MarkLogic Admin application at Groups -> Default -> Diagnostics. 
Be sure to turn trace events on as well.

## Match examples

During the mastering step of the "persons" flow, several pairs of person documents will be matched and merged together. 
A description of each match is provided below. 

### Exact match

The two ssn-match*.json documents have an Exact match on SSN. Each gets a score of 20, which 
meets the Match threshold, and so they are merged.

### Synonym match

The two first-name-synonym*.json documents have an Exact match on LastName, giving each a score of 10. 
The FirstName Synonym matcher then contributes a score of 10 for the person with a first name of "Robert", 
as that has a synonym of "Bob" per the thesaurus document loaded at "/thesaurus/nicknames.xml". This results
in a combined score of 20, and the documents are thus merged. 

### Double Metaphone match

The two first-name-double-metaphone*.json documents have an Exact match on LastName, giving each a score of 10. 
The FirstName Double Metaphone matcher then contributes a score of 10 for both persons, giving each a score of 20, 
resulting in a merge.

### Boost from Zip

The two last-name-plus-zip-boost*.json documents have an Exact match on LastName, giving each a score 
of 10. The Zip matcher then provides a boost score of 10, resulting in a combined score of 20, and thus
the documents are merged.

### Reduce match

The two last-name-address-reduce*.json documents have an Exact match on LastName, giving each a score of 10. 
The FirstName Double Metaphone matcher also contributes a score of 10 for both persons. But because the documents have
the same address, the Address Reduce matcher lowers the score by 5, for a total of 15. This isn't enough for the
documents to be merged; instead, a notification document is created because 15 is meets the "Likely Match" threshold.

### Custom match query

The two last-name-dob-custom*.json documents have an Exact match on LastName, giving each a score of 10. The document
with a DateOfBirth of 1990-01-01 then matches the one with a DateOfBirth of 1991-01-01 due to the simple query expansion 
in the custom dob-match.xqy module (found at src/main/ml-modules/root/custom-modules/custom/dob-match.xqy). This 
contributes a score of 10, resulting in a total of 20, which causes the two documents to be merged.  

### Custom match action example

The two last-name-slight-match*.json documents have an Exact match on LastName, giving each a score of 10. The scores 
are then reduced by 5 due to the Reduce match on Address. This meets the threshold for "Slight Match" threshold, which
is associated with a custom match action that simply logs some information about the match.

## Merge examples

When two documents are found to meet threshold with an action of "Merge", the two documents will be merged together based
on the merge options for the mastering step. This project demonstrates a few examples of how to customize those options. 
You can also refer to the [documentation for out-of-the-box and custom merge options](https://marklogic-community.github.io/smart-mastering-core/docs/merge-algorithms/). 

### Merging Address via a merge strategy

As a simple example for determining which value to keep when merging two documents together, the merge options in the 
persons flow has a rule for merging Address. This rule states that only one value can be retained, and that value should
be chosen based on the length of each candidate value, with the longest value being chosen. This of course would not be
a realistic way for choosing which address to retain, but it shows how easily the rule can be configured within the 
user interface for a mastering step.

Note that the Address merge option also utilizes a merge strategy. A strategy is a convenient way of defining merge rules, 
such as max values and max sources, and then applying them against many properties, thus avoiding having to duplicate the
definition of those rules. In this example, a merge strategy named "retain-single-value" is being used. The strategy can
be modified via the mastering step user interface, and new strategies can be created as well.

### Custom merge example

A custom merge algorithm is used on the DateOfBirth property. The implementation of this, found in the file 
src/main/ml-modules/custom-modules/custom/dob-merge.sjs, simply orders the DateOfBirth values before they are merged
together. 

### Merge collections

When a particular mastering event occurs, such as merging or archiving entities, the mastering step allows for the 
collections on an entity document to be modified. Collections can either be added, removed, or overwritten (the "set" option). 

In this example, three merge collection rules have been set:

1. When an entity is found not to match any other entities, it is added to the "no-match" collection.
1. When a notification is created due to a likely match between two entities, it is added to the "likely-match" collection.
1. When a merge occurs, the entities being merged are removed from the "no-match" and "likely-match" collections, in 
case they had previously been inserted into these collections. 

### Sorting sources based on timestamp

Within a set of merge options is an array of algorithms. The standard algorithm that is included by default allows for
defining a timestamp path that is used for sorting sources in the header of an entity envelope. In the persons flow, the
timestamp path is configured to point to the "createdOn" property:

```
"stdAlgorithm" : {
  "timestamp" : {
    "path": "/envelope/headers/createdOn"
  }
}
```

When two entities are merged together, their combined array of sources will be sorted in descending order based on the
values from in the timestamp path on each entity. Note that in this example project, only one source is present, and thus the 
sorting doesn't have any impact. Rather, the configuration above is included simply to show how to configure the timestamp
path. 



