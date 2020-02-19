HOW TO DOWNLOAD PUPPETEER:
1. install node
2. install puppeteer by typing "npm i puppeteer"

RUNNING TESTS:
1. change the host url in 'config.json' to the vm you're testing
2. change the username/password (currently set to admin/admin) in 'config.json'
3. run "node index.js TESTNAME"
    ex: "node index.js browseDocs"
4. OR you can run ./run_all.sh and every test will be ran separately, and then output to json files within the results dir (results/results%Y%m%d_%H%M%S)

    *** RUN index_all.js INSTEAD OF index.js TO GET A FULL PERFORMANCE REPORT -- index.js reports duration of API calls in ms ***

BROWSEDOCS.js:
1. This script simply browses x amount pages of documents without selecting any facets. 
2. You can change the number of pages it browses by changing the variable "browseDocs" in the 'config.json' file.

COLLECTIONS.js:
1. This script browses x amount pages of documents after selecting c amount of collection facets.
2. You can change the number of pages it browses by changing the variable "browseDocs" in the 'config.json' file.
3. You can change the number of collection facets it selects by changing the variable "numCollections" in the 'config.json' file. 

FLOWS.js:
1. This script browses x amount pages of documents after selecting f amount of flow facets.
2. You can change the number of pages it browses by changing the variable "browseDocs" in the 'config.json' file.
3. You can change the number of flow facets it selects by changing the variable "numFlows" in the 'config.json' file. 

STEPS.js
1. This script browses x amount pages of documents after selecting s amount of step facets.
2. You can change the number of pages it browses by changing the variable "browseDocs" in the 'config.json' file.
3. You can change the number of step facets it selects by changing the variable "numSteps" in the 'config.json' file. 

ALLFACETS.js
1. This script browses x amount pages of documents after selecting c amount of collection facets, f amount of flow facets, s amount of step facets.
2. You can change the number of pages it browses by changing the variable "browseDocs" in the 'config.json' file.
3. You can change the number of collection facets it selects by changing the variable "numCollections" at the top of the script
4. You can change the number of flow facets it selects by changing the variable "numFlows" in the 'config.json' file.
5. You can change the number of step facets it selects by changing the variable "numSteps" in the 'config.json' file.

QUERIES.js
1. This script browses x amount pages of documents after querying each term in queryArray (currently hardcoded at the top of the file).
2. You can change the number of pages it browses by changing the variable "browseQueryDocs" in the 'config.json' file.
3. This is meant to be a longer test, specifically used for deeper dives into performance issues.
