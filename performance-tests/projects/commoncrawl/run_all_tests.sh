#!/bin/bash

collect ()
{
host=$1
test=$2
start=$3
end=$4

if  [  "$mlManageSimpleSsl" == "true" ]
then
   scheme="https"
   args="--meters-ssl=true --meters-port=8002"
else
   scheme="http"
   args=""
fi



curl  -s --anyauth --user $mlUsername:$mlPassword "$scheme://$host:8002/manage/v2?format=json"


version=`curl  -s --anyauth --user $mlUsername:$mlPassword "$scheme://$host:8002/manage/v2?format=json" | jq '.["local-cluster-default"].version' `

if  [  "$mlIsProvisionedEnvironment" == "true" ]
then
  hosts="" # we won't collect request logs from DHS
  feature="dhs_websites"
else
  hosts=`curl  -s --anyauth --user $mlUsername:$mlPassword "$scheme://$host:8002/manage/v2/hosts?format=json" | jq  '.["host-default-list"]["list-items"]["list-item"][].nameref'`
  feature="dhf_websites"

fi

version=${version//\"/}
echo $version

# Please see commoncrawl wiki page for information on publishing to PEAR.
pear_host=
pear_user=
pear_pass=

rlogs="--request-logs-file=8010_RequestLog.txt"
for h in $hosts
do
   h=${h//\"/}
   h=${h//.marklogic.com/}
#  dstat="--dstat=$h $dstat"
   rlogs="--request-logs=$h $rlogs"
done



./collect-stats.sh $args --config --summary --feature=$feature --version=$version --test=$test $rlogs  $dstat --meters=$host --meters-user=$mlUsername --meters-pass=$mlPassword --archive=$pear_host --archive-user=$pear_user --archive-pass=$pear_pass --start="$start" --end="$end"


}


ENV=$1

if [ "$ENV" != "" ]
then
  GRADLE_FILE="gradle-$ENV.properties"
  GRADLE_ARG="-PenvironmentName=$ENV"
else
  GRADLE_FILE="gradle.properties"
  GRADLE_ARG="-Ptesting=true"
fi

. ./$GRADLE_FILE


if  [  "$mlStagingSimpleSsl" == "true" ]
then
  ./gradlew $GRADLE_ARG  hubDeployAsDeveloper
else
  ./gradlew $GRADLE_ARG  mlDeploy
fi



threads=64


d=`date -Is`
echo "Loading iplocations"
./ingest_mlcp_iplocation.sh $GRADLE_FILE $threads /project/archive1/common/DHS/iplocations
e=`date -Is`
collect $mlHost "ingest_mlcp_iplocation_${threads}" $d $e

d=`date -Is`
echo "Loading webpages"
./ingest_mlcp_webpages.sh $GRADLE_FILE $threads /project/archive1/common/DHS/commoncrawl/0/
e=`date -Is`
collect $mlHost "ingest_mlcp_webpages_${threads}" $d $e

d=`date -Is`
echo "Mapping"
./flow.sh  "$GRADLE_ARG"  mapping  $threads
e=`date -Is`
collect $mlHost "mapping_${threads}" $d $e

d=`date -Is`
echo "Matching"
./flow.sh "$GRADLE_ARG"  mastering $threads '-Psteps=1'
e=`date -Is`
collect $mlHost "matching_${threads}" $d $e


d=`date -Is`
echo "Merging"
./flow.sh "$GRADLE_ARG" mastering $threads '-Psteps=2'
e=`date -Is`
collect $mlHost "merging_${threads}" $d $e


