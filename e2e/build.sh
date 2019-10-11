set e+x

LOCAL_NAME=e2e

echo "Building $LOCAL_NAME"
docker build -t $LOCAL_NAME .
