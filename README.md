# MarkLogic Data Hub Explorer-UI

Datahub Explorer is a React UI that provides viewing capabilities for data that is created and curated by 
MarkLogic DB and MarkLogic Data Hub. Entity Models are created by Users in MarkLogic DB. After Data Hub 
Ingests and Curates, harmonized data is loaded into MarkLogic DB for those Entities. Explorer is the tool 
to analyze data stored in those Entities.

# Version Support

  - MarkLogic Server 10.0-2.1 and later
  - Data Hub 5.1.x and later

## Development Setup

Below are the commands to start the Data Hub Explorer UI

```
# Clone repo
git clone https://project.marklogic.com/repo/scm/prod/explorer-ui.git

# Install dependencies
cd explorer-ui
npm install

# Start the UI development environment
npm start

# Setup the backend development environment
Follow the README instructions to build and run the server locally from command line
https://project.marklogic.com/repo/projects/PROD/repos/datahubenterprise/browse?at=refs%2Fheads%2Fdevelop
```

## Unit Testing
```
# Run Unit Tests
npm run test
```