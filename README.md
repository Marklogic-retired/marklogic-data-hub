# MarkLogic Data Hub Explorer-UI

Datahub Explorer is a REACT-driven system that provides viewing capabilities for end users. This release is for DHS environments only.
This project is the web service that serves content to explorer-ui.

# Version Support

  - MarkLogic Server 10.0-2.1 and later
  - Data Hub 5.1.x and later

# Getting Started
Explorer is distributed as a group of three Docker containers, one of which contains the UI environment, one of which contains the backed, 
and the third contains MarkLogic and is only packaged as a convenience and is only intended for demo use.

The customer is expected to use a complete MarkLogic installation, as supported by Data Hub Services rather than the containerized version. 
That version is not supported for any purpose other than demonstration. 

## Development Setup

Below are the commands to start the Data Hub Explorer UI

```
# Install dependencies
npm install

# Start the UI development environment
npm start

# Setup the backend development environment
Follow the README instructions to build and run the server locally from command line
https://project.marklogic.com/repo/projects/PROD/repos/datahubenterprise/browse?at=refs%2Fheads%2Fdevelop
```

## Build Docker Container

Make sure you have docker installed on your local system.

```
# Build Docker image
docker build -t explorer-ui .

# Run Docker container
Replace API_URL with server IP
docker run -e API_URL=172.0.1.0:8080 -p 80:80 explorer-ui

# Build and Run the backend Docker container
Follow the README instructions in the server repo
https://project.marklogic.com/repo/projects/PROD/repos/datahubenterprise/browse?at=refs%2Fheads%2Fdevelop
```
see more details:
https://wiki.marklogic.com/display/ENGINEERING/Run+Explorer+via+Docker#f520f246cb4a42cb9035ba4f62231ada

## Unit Testing
```
# Run Unit Tests
npm run test
```

## Run explore BE and FE using docker-compose
https://wiki.marklogic.com/display/ENGINEERING/Run+Explorer+via+Docker#RunExplorerviaDocker-SetupMLRegistry

# Contribute
Explorer is a closed-source project. You can contribute to its success by reporting errors you encounter and 
suggesting improvement or additional features to Product Management.

# Support
The MarkLogic Data Hub is designed, written, and maintained by [MarkLogic][marklogic] Engineering.