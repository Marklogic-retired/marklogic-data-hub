#!/bin/bash

#######################################################
# taken from https://github.com/grtjn/mlvagrant/blob/master/opt/vagrant/setup-ml-master.sh
#
# restart_check(baseline_timestamp, caller_lineno)
#
# Use the timestamp service to detect a server restart, given a
# a baseline timestamp. Use N_RETRY and RETRY_INTERVAL to tune
# the test length. Include authentication in the curl command
# so the function works whether or not security is initialized.
#   $1 :  The baseline timestamp
#   $2 :  Invokers LINENO, for improved error reporting
# Returns 0 if restart is detected, exits with an error if not.
#
function restart_check {
  echo "Restart check for localhost..."
  LAST_START=`$AUTH_CURL --max-time 1 -s "http://localhost:8001/admin/v1/timestamp"`
  for i in `seq 1 ${N_RETRY}`; do
    # continue as long as timestamp didn't change, or no output was returned
    if [ "$1" == "$LAST_START" ] || [ "$LAST_START" == "" ]; then
      sleep ${RETRY_INTERVAL}
      echo "Retrying..."
      LAST_START=`$AUTH_CURL --max-time 1 -s "http://localhost:8001/admin/v1/timestamp"`
    else
      return 0
    fi
  done
  echo "ERROR: Line $2: Failed to restart localhost"
  exit 1
}

sudo /etc/init.d/MarkLogic start
sleep 30
curl -X POST -d "" http://localhost:8001/admin/v1/init
sleep 30

TIMESTAMP=`curl -X POST \
     -H "Content-type: application/x-www-form-urlencoded" \
     --data "admin-username=admin" \
     --data "admin-password=admin" \
     --data "realm=public" \
     "http://localhost:8001/admin/v1/instance-admin" \
     | grep "last-startup" \
     | sed 's%^.*<last-startup.*>\(.*\)</last-startup>.*$%\1%'`
  if [ "$TIMESTAMP" == "" ]; then
    echo "ERROR: Failed to get instance-admin timestamp." >&2
    exit 1
  fi

restart_check $TIMESTAMP $LINENO
