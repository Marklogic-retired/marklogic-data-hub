#!/bin/sh

./gradlew mlDeploy

./gradlew hubRunFlow -PflowName=AdvantageFlow -PentityName=Customer -PbatchSize=100 -PthreadCount=4 -Psteps="1,2"

./gradlew mlDeployUsers
