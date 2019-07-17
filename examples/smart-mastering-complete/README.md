This project provides examples of various mastering features in DHF. 

To try this project out, start with a clean MarkLogic instance, initialize this project, and then deploy this project's 
application via Gradle:

    ./gradlew -i hubInit mlDeploy

Then, start up QuickStart and browse to this project folder. You can then run the "persons" flow to ingest, map, and 
master the person documents found in the ./data/persons directory.  

Before running the flow, you may want to turn on the "SM-MATCH" trace event in MarkLogic to see some logging for each 
match that the mastering step makes. You can do this via the MarkLogic Admin application at Groups -> Default -> Diagnostics. 
Be sure to turn trace events on as well.

## Match examples

During the mastering step of the "persons" flow, several pairs of person documents will be matched and merged together. 
A description of each match is provided below. 

### Exact match

The two ssn-match*.json documents have an Exact match on ZipCode. Each gets a score of 20, which 
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

