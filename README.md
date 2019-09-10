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
docker run -p 80:80 explorer-ui
```

### Unit Testing
```
# Run Unit Tests
npm run test
```

