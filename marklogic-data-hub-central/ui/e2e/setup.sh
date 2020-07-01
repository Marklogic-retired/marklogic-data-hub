#!/bin/bash
set -e

if [[ $1 != *"dhs"* || $2 != *"mlHost"* ]]
then
        echo "This script must be run with dhs=<true/false> mlHost=<dhsHost/localhost>"
        exit 0
fi
DHS=`echo $1 | cut -d'=' -f 2`
mlHost=`echo $2 | cut -d'=' -f 2`
env=local
#credentials='-PmlUsername=hc-developer -PmlPassword=password'

cd hc-qa-project
./gradlew hubInit

if $DHS
then
        env=dhs
        sed -i '' "s/mlHost=/mlHost=$mlHost/g" gradle-dhs.properties
        ./gradlew hubSaveIndexes --info --stacktrace
        ./gradlew hubGeneratePII -PenvironmentName=$env --info --stacktrace
        ./gradlew hubDeployAsDeveloper  --info --stacktrace -PenvironmentName=$env
else
        cp ../cypress/fixtures/users/* src/main/ml-config/security/users/

        ./gradlew mlDeploy -PmlUsername=admin -PmlPassword=admin --info --stacktrace
        ./gradlew hubSaveIndexes --info --stacktrace
        ./gradlew hubGeneratePII --info --stacktrace
        ./gradlew hubDeployAsDeveloper --info --stacktrace
fi

        ./gradlew hubRunFlow -PenvironmentName=$env -PflowName=CurateCustomerJSON --info --stacktrace
        ./gradlew hubRunFlow -PenvironmentName=$env -PflowName=CurateCustomerXML --info --stacktrace
        ./gradlew hubRunFlow -PenvironmentName=$env -PflowName=personJSON -Psteps='1,2' --info --stacktrace
        ./gradlew hubRunFlow -PenvironmentName=$env -PflowName=migratedFlow --info --stacktrace
