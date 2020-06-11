This hc-qa-project is intended to run HC e2e test. 

## How to run the tests

Run the setup script first from under e2e directory, to initialize and deploy user artifacts in DHS:

    ./setup.sh dhs=true mlHost=curationEndpoint
    
Then run the Cypress tests:

    npm run cypress:run
