To run performance test of the graph UI given x amount of entities:

1. Install Node
2. Install Puppeteer
3. Deploy a ML project and load x numbers of entities (the tests were ran with 10, 100, 500, 1000 entities)
4. Edit config.json as needed
5. Run "node index.js loadGraphUI"

NOTE TO RUN ON PERF MACHINES / VMS: 
You have to turn headless on. To do this, edit config.json and change headless to be true.
