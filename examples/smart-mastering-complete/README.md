
The two ssn-match*.json documents have an Exact match on ZipCode. Each gets a score of 20, which 
meets the Match threshold, and so they are merged.

The two last-name-plus-zip-boost*.json documents have an Exact match on LastName, giving each a score 
of 10. The Zip query then provides a boost score of 10, resulting in a combined score of 20, and thus
the documents are merged.


