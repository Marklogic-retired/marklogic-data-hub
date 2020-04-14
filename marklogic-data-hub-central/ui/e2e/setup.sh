#!/bin/bash
set e+x

cd qa-project

./gradlew hubInit
./gradlew mlDeploy --info
./gradlew hubSaveIndexes --info
./gradlew hubDeployAsDeveloper --info

./gradlew hubRunFlow -PflowName=AdvantageFlow -PentityName=Customer -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"
./gradlew hubRunFlow -PflowName=PersonFlow -PentityName=Person -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"
./gradlew hubRunFlow -PflowName=PersonXMLFlow -PentityName=PersonXML -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"
