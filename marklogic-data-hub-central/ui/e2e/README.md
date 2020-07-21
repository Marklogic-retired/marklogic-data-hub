This hc-qa-project is intended to run HC e2e test. 

## How to run the tests

Run the setup script first from under `marklogic-data-hub-central/ui/e2e` directory, to initialize, deploy and run flows:

    ./setup.sh dhs=<true/false> mlHost=<curatoinEndpoint/localhost>
 
Boot up HC application from `marklogic-data-hub-central` directory either via bootRun or HC war
 
    For DHS –
        * ./gradlew bootRun -PmlHost=<curationEndpoint>
        * java -jar <HC.war> --mlHost=<curationEndpoint> --spring.profiles.active=dev
        
    For local - 
        * ./gradlew bootRun -PhubUseLocalDefaults=true
        * java -jar <HC.war> --hubUseLocalDefaults=true --spring.profiles.active=dev

 
Then run the Cypress tests. Use appropriate run scripts defined in package.json to run on different browsers:

    For DHS –
        * npm run cy:run -- --env mlHost=<curationEndpoint>
        
    For local - 
        * electron(Default) – npm run cy:run
        * chrome – npm run cy:run-chrome
        * firefox – npm run cy:run-firefox (Although this wont work until Cypress 5.0 is released. See previous comment)
              

    For running specific spec/suite

        * npm run cy:run -- --spec "cypress/integration/login/*"
        * npm run cy:run -- --spec "cypress/integration/modeling/*"
        * npm run cy:run -- --spec "cypress/integration/curation/*"
        * npm run cy:run -- --spec "cypress/integration/explorer/*"
