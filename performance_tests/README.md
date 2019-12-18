HOW TO DOWNLOAD PUPPETEER:
1. install node
2. install puppeteer by typing "npm i puppeteer"

RUNNING TESTS:
1. change the goto url in index.js to the vm you're testing
2. change the username/password (currently set to admin/admin)
3. run "node index.js TESTNAME"
    ex: "node index.js browseDocs"

BROWSEDOCS.js:
1. This script simply browses x amount pages of documents without selecting any facets. 
2. You can change the number of pages it browses by changing the const variable "browseDocs" at the top of the script.

COLLECTIONS.js:
1. This script browses x amount pages of documents after selecting c amount of collection facets.
2. You can change the number of pages it browses by changing the const variable "browseDocs" at the top of the script.
3. You can change the number of collection facets it selects by changing the const variable "numCollections" at the top of the script. 

FLOWS.js:
1. This script browses x amount pages of documents after selecting f amount of flow facets.
2. You can change the number of pages it browses by changing the const variable "browseDocs" at the top of the script.
3. You can change the number of flow facets it selects by changing the const variable "numFlows" at the top of the script. 

STEPS.js
1. This script browses x amount pages of documents after selecting s amount of step facets.
2. You can change the number of pages it browses by changing the const variable "browseDocs" at the top of the script.
3. You can change the number of step facets it selects by changing the const variable "numSteps" at the top of the script. 

ALLFACETS.js
1. This script browses x amount pages of documents after selecting c amount of collection facets, f amount of flow facets, s amount of step facets.
2. You can change the number of pages it browses by changing the const variable "browseDocs" at the top of the script.
3. You can change the number of collection facets it selects by changing the const variable "numCollections" at the top of the script
4. You can change the number of flow facets it selects by changing the const variable "numFlows" at the top of the script.
5. You can change the number of step facets it selects by changing the const variable "numSteps" at the top of the script.
