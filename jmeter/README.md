# explorer-concurrent-users

To setup: ./setup.sh

To teardown: ./teardown.sh

Standalone tasks:

1) Install data-hub and add entities:
./gradlew mlDeploy

2) Run flow (ingestion and mapping):
./gradlew hubRunFlow -PflowName=AdvantageFlow -PentityName=Customer -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"

3) Create 10 users:
./gradlew mlDeployUsers

4) Uninstall data-hub
./gradlew mlUndeploy -Pconfirm=true
