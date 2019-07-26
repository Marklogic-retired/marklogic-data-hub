# Example HR Hub
This example shows how to load data from 2 HR systems. 

The data are separated into 2 folders under the input/ folder.  
```
|-- input  
  |-- AcmeTech
    |-- 32920.json
    |-- 34324.json
  |-- GlobalCorp
    |-- DeptTable.csv
    |-- EmployeeTable.csv
    |-- SalaryTable.csv
```

# TLDR; How do I run it?
Check out the [HR Hub Tutorial](https://marklogic.github.io/marklogic-data-hub/getting-started) on the Datahub Site.

# Global Corp
Global Corp has exported the Employee data from a relational database. They are provided to you as csv files, one for each table.

# Acme Tech
Acme Tech uses a SAAS for managing employees. The data is provided as JSON documents that came straight out of the SAAS REST API.

# What is this example?
In this example we are loading the CSV table dumps from Global Corp and the JSON documents from Acme Tech into the Hub staging area. We then harmonize the two data sources into the final area by extracting common header fields. The header fields we extract are:

- Employee ID
- Employee Hire Date
- Employee Salary

# Wait. What is a data Hub?
Get started over at the [Data Hub Site](https://marklogic.github.io/marklogic-data-hub/)
