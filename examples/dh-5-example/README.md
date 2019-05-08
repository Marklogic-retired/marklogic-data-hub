This example helps Getting Started with using and configuring ingestion, mapping and mastering flows.
There are 3 flow artifacts available in the flows directory.

1) ingestion_only-flow.flow.json - This file contains 7 steps. Each step refers to ingesting differnt format of input files. The input files are located in the "input" directory

2) ingestion_mapping-flow.flow.json - This file contains 4 steps. The input files are located in the "input" directory
	Step 1 and Step 2 to ingest and harmonize (using mapping) json documents.
	Step 3 and Step 4 to ingest and harmonize (using mapping) xml documents.

3) ingestion_mapping_mastering-flow.flow.json - This file contains 3 steps. The input files are located in the "mastering-input" directory
	Step 1 to ingest json documents
	Step 2 to harmonize json documents
	Step 3 to master json documents


gradle task to run a Flow:

1) ./gradlew hubRunFlow -PflowName=ingestion_only-flow
2) ./gradlew hubRunFlow -PflowName=ingestion_mapping-flow
3) ./gradlew hubRunFlow -PflowName=ingestion_mapping_mastering-flow

gradle task to run only a single step or multiple steps in a Flow:

1) ./gradlew hubRunFlow -PflowName=ingestion_only-flow -Psteps=1
2) ./gradlew hubRunFlow -PflowName=ingestion_only-flow -Psteps=2,3