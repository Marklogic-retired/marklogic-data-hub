This hc-qa-project is intended to run HC e2e test. 

## How to run the tests

Run the setup script first from under `marklogic-data-hub-central/ui/e2e` directory, to initialize, deploy and run flows:

    For DHS -
        * Create users as admin using the payload in cypress/fixtures/users for the tests
        * ./setup.sh dhs=true mlHost=<curationEndpoint> mlSecurityUsername=<mladmin_username> mlSecurityPassword=<mladmin_password>
            * example of curation endpoint is dwgz7dnkj.ec2dentifier10.a.marklogicsvc.com
            * credentials for <mladmin_username> and <mladmin_password> can be found in the same service email where the curation endpoint is provided
        
    For local - 
        * ./setup.sh dhs=false mlHost=localhost mlSecurityUsername=admin mlSecurityPassword=admin

Boot up HC application from `marklogic-data-hub-central` directory either via bootRun or HC war
 
    For DHS –
        * ./gradlew bootRun -PmlHost=<curationEndpoint>
        * java -jar </path/to/HC.war> --mlHost=<curationEndpoint> --spring.profiles.active=dev
        
    For local - 
        * ./gradlew bootRun -PhubUseLocalDefaults=true
        * java -jar </path/to/HC.war> --hubUseLocalDefaults=true --spring.profiles.active=dev

 
Then run the Cypress tests. Use appropriate run scripts defined in package.json to run on different browsers:

    For DHS –
        * We have to first set mlHost and CYPRERSS_BASE_URL as environment variables
            * mlHost is the curationEndpoint, example: dwgz7dnkj.ec2dentifier10.a.marklogicsvc.com
            * CYPRESS_BASE_URL is the url:port, where HC is running
        * export mlHost=<curationEndpoint>
        * export CYPRESS_BASE_URL=http://<host_HC>:<port_HC> 
        * npm run cy:run -- --env "mlHost=dwgz7dnkj.ec2dentifier10.a.marklogicsvc.com,CYPRESS_BASE_URL=http://<host_HC>:<port_HC>"
        
    For local - 
        * electron(Default) – npm run cy:run
        * chrome – npm run cy:run-chrome
        * firefox – npm run cy:run-firefox (Will work only with Cypress 5.0 onwards)
              

    For running specific spec/suite

        * npm run cy:run -- --spec "cypress/integration/login/*"
        * npm run cy:run -- --spec "cypress/integration/modeling/*"
        * npm run cy:run -- --spec "cypress/integration/curation/*"
        * npm run cy:run -- --spec "cypress/integration/explorer/*"
