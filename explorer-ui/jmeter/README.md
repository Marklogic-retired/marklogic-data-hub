# Running explorer concurrent users jmeter tests

- Run explorer backend springboot:
* git clone Datahub Enterprise: https://project.marklogic.com/repo/scm/prod/datahubenterprise.git
* checkout develop branch
* ./gradlew build -x test -Pskipui=true
* java -jar explorer/build/libs/explorer-5.0.2.jar & (run this is a background process)

Make sure that there is no DHF installed

- git clone Explorer-UI: https://project.marklogic.com/repo/scm/prod/explorer-ui.git
- git checkout develop
- cd jmeter
- To setup: ./setup.sh

- To run jmeter test: jmeter -n -Jthreads=10 -Jcount=1 -Jrumpup=10 -Jhost=192.168.56.1 -Jport=3000 -t explorer_performance.jmx -l result.jtl

- To teardown: ./teardown.sh

# Standalone tasks:

1) Install data-hub and add entities:
./gradlew mlDeploy

2) Run flow (ingestion and mapping):
./gradlew hubRunFlow -PflowName=AdvantageFlow -PentityName=Customer -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"

3) Create 10 users:
./gradlew mlDeployUsers

4) Uninstall data-hub
./gradlew mlUndeploy -Pconfirm=true
