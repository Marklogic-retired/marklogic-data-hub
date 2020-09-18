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

cd hc-qa-project
./gradlew hubInit

if $DHS
then
        env=dhs
        perl -i -pe"s/mlHost=.*/mlHost=$mlHost/g" gradle-dhs.properties
        ./gradlew hubDeploy -PenvironmentName=$env --info --stacktrace
else
        cp ../cypress/fixtures/users/* src/main/ml-config/security/users/
        cp ../cypress/fixtures/roles/* src/main/ml-config/security/roles/

        ./gradlew mlDeploy -PmlUsername=admin -PmlPassword=admin --info --stacktrace
        # clean up custom roles so they don't break hubDeploy since roles were created by admin
        rm -R src/main/ml-config/security/roles/
        ./gradlew hubDeploy --info --stacktrace
fi

./gradlew hubRunFlow -PenvironmentName=$env -PflowName=CurateCustomerJSON --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=CurateCustomerXML --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=personJSON -Psteps='1,2,3' --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=personXML -Psteps='1' --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=convertedFlow --info --stacktrace

#Verify flow was run successfully based on record count in staging and final database.
#The task would fail if there was a count mismatch
./gradlew verifyStagingCounts -PenvironmentName=$env -q
./gradlew verifyFinalCounts -PenvironmentName=$env -q
