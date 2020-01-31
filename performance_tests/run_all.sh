echo "Running: Browse Docs"
node index.js browseDocs.js > browseDoc_timing
echo "Running: Search"
node index.js search.js > search_timing
echo "Running: Collections"
node index.js collections.js > collection_timing
echo "Running: Steps"
node index.js steps.js > steps_timing
echo "Running: Flows"
node index.js flows.js > flows_timing
echo "Running: All Facets"
node index.js allFacets.js > allFacets_timing
