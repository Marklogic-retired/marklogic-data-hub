#!/bin/bash

resultDir=results/results$(date +%Y%m%d_%H%M%S); mkdir -p $resultDir

node index.js browseDocs > $resultDir/browseDocs.json
node index.js collections > $resultDir/collections.json
node index.js flows > $resultDir/flows.json
node index.js steps > $resultDir/steps.json
node index.js queries > $resultDir/queries.json
node index.js allFacets > $resultDir/allFacets.json
