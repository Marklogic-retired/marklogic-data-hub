#!/bin/bash
set -e

if [[ $1 != *"dhs"* || $2 != *"mlHost"* || $3 != *"mlSecurityUsername"* || $4 != *"mlSecurityPassword"* ]]
then
        echo "This script must be run with dhs=<true/false> mlHost=<dhsHost/localhost> mlSecurityUsername=<mlSecurityUsername/admin> mlSecurityPassword=<mlSecurityPassword/admin>"
        exit 0
fi
DHS=`echo $1 | cut -d'=' -f 2`
mlHost=`echo $2 | cut -d'=' -f 2`
env=local
mlSecurityUsername=`echo $3 | cut -d'=' -f 2`
mlSecurityPassword=`echo $4 | cut -d'=' -f 2`

cd hc-qa-project
./gradlew hubInit

cp ../cypress/fixtures/users/* src/main/ml-config/security/users/
cp ../cypress/fixtures/roles/* src/main/ml-config/security/roles/

if $DHS
then
        env=dhs
        perl -i -pe"s/mlHost=.*/mlHost=$mlHost/g" gradle-dhs.properties
        ./gradlew -i mldeployusers -PenvironmentName=$env -PmlUsername=$mlSecurityUsername -PmlPassword=$mlSecurityPassword
        ./gradlew hubDeploy -PenvironmentName=$env --info --stacktrace
else
        ./gradlew mlDeploy -PmlUsername=$mlSecurityUsername -PmlPassword=$mlSecurityPassword --info --stacktrace
        # deployAsDeveloper so custom roles don't break hubDeploy since roles were created by admin
        ./gradlew hubDeployAsDeveloper --info --stacktrace
fi

./gradlew hubRunFlow -PenvironmentName=$env -PflowName=CurateCustomerJSON --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=CurateCustomerXML --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=CurateCustomerWithRelatedEntitiesJSON --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=personJSON -Psteps='1,2,3' --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=personXML -Psteps='1' --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=convertedFlow --info --stacktrace
./gradlew hubRunFlow -PenvironmentName=$env -PflowName=CurateClientJSON --info --stacktrace

# Add document properites to records for e2e test
./gradlew addDocProperties -PenvironmentName=$env --info --stacktrace

#Verify flow was run successfully based on record count in staging and final database.
#The task would fail if there was a count mismatch
./gradlew verifyStagingCounts -PenvironmentName=$env -q
./gradlew verifyFinalCounts -PenvironmentName=$env -q
