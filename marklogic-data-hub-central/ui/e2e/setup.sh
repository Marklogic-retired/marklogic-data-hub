#!/bin/bash
set -e
cd qa-project;

if [[ $1 != *"dhs"* || $2 != *"mlHost"* ]]
then
        echo "This script must be run with dhs=<true/false> mlHost=<dhsHost/localhost>"
        exit 0
fi
DHS=`echo $1 | cut -d'=' -f 2`
mlHost=`echo $2 | cut -d'=' -f 2`
env='local'

credentials='-PmlUsername=hc-developer -PmlPassword=password'

./gradlew hubInit
./gradlew hubMigrateFlows -Pconfirm=true

if $DHS
then
        ./gradlew hubDeployAsDeveloper  --info --stacktrace $credentials -PenvironmentName=dhs -PmlHost=$mlHost
        env='dhs'
else
        cp ../cypress/fixtures/users/* src/main/ml-config/security/users/
        ./gradlew mlDeploy -PmlHost=$mlHost --info --stacktrace
        ./gradlew hubSaveIndexes -PmlHost=$mlHost --info --stacktrace
        ./gradlew hubDeployAsDeveloper $credentials -PmlHost=$mlHost --info --stacktrace
fi

./gradlew hubRunFlow $credentials -PenvironmentName=$env -PflowName=AdvantageFlow -PentityName=Customer -PbatchSize=100 -PthreadCount=4 -Psteps='1,2' -PmlHost=$mlHost  --info --stacktrace
./gradlew hubRunFlow $credentials -PenvironmentName=$env -PflowName=PersonFlow -PentityName=Person -PbatchSize=100 -PthreadCount=4 -Psteps='1,2' -PmlHost=$mlHost  --info --stacktrace
./gradlew hubRunFlow $credentials -PenvironmentName=$env -PflowName=PersonXMLFlow -PentityName=PersonXML -PbatchSize=100 -PthreadCount=4 -Psteps='1,2' -PmlHost=$mlHost  --info --stacktrace
