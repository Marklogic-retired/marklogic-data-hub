# Data Hub Explorer UI

### Development Setup

Below are the commands to start the Data Hub Explorer UI

```
# Install dependencies
npm install

# Start the development environment
npm start
```

### Build Docker Container

Make sure you have docker installed on your local system.

```
# Build Docker image
docker build -t explorer-ui .

# Run Docker container
Replace API_URL with server IP
docker run -e API_URL=172.0.1.0:8080 -p 80:80 explorer-ui
```

### Unit Testing
```
# Run Unit Tests
npm run test
```

