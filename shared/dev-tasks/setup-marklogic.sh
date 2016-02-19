#!/bin/bash

sudo /etc/init.d/MarkLogic start
sleep 10
curl -X POST -d "" http://localhost:8001/admin/v1/init
sleep 10
curl -X POST -H "Content-type: application/x-www-form-urlencoded" \
     --data "admin-username=admin" \
     --data "admin-password=admin" \
     --data "realm=public" \
     "http://localhost:8001/admin/v1/instance-admin"
sleep 10
