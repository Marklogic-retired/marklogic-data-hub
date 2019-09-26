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

# Edit config/nginx.conf file
upstream api_server {
	server	172.0.1.0:8080; // Enter backend ip address here
}

# Run Docker container
docker run -p 80:80 explorer-ui
```

### Unit Testing
```
# Run Unit Tests
npm run test
```

