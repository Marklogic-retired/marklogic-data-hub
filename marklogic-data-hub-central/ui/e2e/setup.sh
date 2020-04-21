#!/bin/bash
set e+x

credentials='-PmlUsername=dh-dev -PmlPassword=dh-dev'
cd qa-project

./gradlew hubInit
cp ../cypress/fixtures/users/* src/main/ml-config/security/users/
./gradlew mlDeploy --info
./gradlew hubSaveIndexes --info
./gradlew hubDeployAsDeveloper $credentials --info


./gradlew hubRunFlow $credentials -PflowName=AdvantageFlow -PentityName=Customer -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"
./gradlew hubRunFlow $credentials -PflowName=PersonFlow -PentityName=Person -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"
./gradlew hubRunFlow $credentials -PflowName=PersonXMLFlow -PentityName=PersonXML -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"
