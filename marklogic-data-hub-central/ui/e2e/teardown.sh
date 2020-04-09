#!/bin/bash

#./gradlew mlUndeploy -Pconfirm=true


echo "Cleaning ML"
sudo mladmin cleandata
sleep 3
echo "Starting ML"
sudo mladmin start
sleep 5
echo "Initializing ML"
curl -X POST -d "" http://localhost:8001/admin/v1/init
sleep 5
echo "Initializing ML security"
curl -X POST -H "Content-type: application/x-www-form-urlencoded" --data "admin-username=admin" --data "admin-password=admin" --data "realm=public" http://localhost:8001/admin/v1/instance-admin
