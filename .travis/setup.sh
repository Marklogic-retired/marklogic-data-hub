#!/bin/sh
#
# Initializes a virgin MarkLogic installation.

HOST=localhost
ADMINUSER=admin
ADMINPASSWORD=admin

/tmp/startml.sh

until curl -fsS --head --digest --user "$ADMINUSER":"$ADMINPASSWORD" http://"$HOST":8001/admin/v1/timestamp # &>/dev/null
do
  echo "MarkLogic hasn't started yet. Retrying in 3 seconds…"
  sleep 3
done

# curl -X POST --data "" http://"$HOST":8001/admin/v1/init
echo "Initializing…"
curl --fail --show-error --silent -X POST --data "" http://"$HOST":8001/admin/v1/init 1>/dev/null
if [[ $? != 0 ]] ; then
    echo "error on init"
    exit 1
fi
echo "Completed initialization. Waiting for restart…"
sleep 20

# curl -fsS --head --digest --user admin:"$ADMINPASSWORD" http://"$HOST":8001/admin/v1/timestamp
# One liner: until curl -fsS --head http://192.168.56.101:8001/admin/v1/timestamp --digest --user admin:admin; do sleep 5; done


until curl -fsS --head --digest --user "$ADMINUSER":"$ADMINPASSWORD" http://"$HOST":8001/admin/v1/timestamp &>/dev/null
do
  echo "Restart hasn't completed. Retrying in 3 seconds…"
  sleep 3
done

# curl -X POST -H "Content-type: application/x-www-form-urlencoded" --data "admin-username=admin" --data "admin-password=********" http://localhost:8001/admin/v1/instance-admin
echo "Starting instance administration…"
curl --fail --show-error --silent \
  -X POST -H "Content-type: application/x-www-form-urlencoded" \
  --data "admin-username=${ADMINUSER}" --data "admin-password=${ADMINPASSWORD}" --data "realm=public" \
  http://"$HOST":8001/admin/v1/instance-admin 1>/dev/null
if [[ $? != 0 ]] ; then
    echo "Error on instance-admin"
    exit 1
fi

echo "Completed instance administration. Waiting for restart…"
sleep 10
until curl -fsS --head --digest --user admin:"$ADMINPASSWORD" http://"$HOST":8001/admin/v1/timestamp &>/dev/null
do
  echo "Restart hasn't completed. Retrying in 5 seconds…"
  sleep 5
done

echo "Turning off log file rotation"
curl --fail --show-error --silent \
  -X PUT --digest -u "$ADMINUSER":"$ADMINPASSWORD" -H "Content-type: application/json" \
  -d '{"rotate-log-files":"never"}' http://"$HOST":8002/manage/v2/groups/Default/properties &>/dev/null

echo "Done!"
exit 0
