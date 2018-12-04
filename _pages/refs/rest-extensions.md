---
layout: inner
title: REST Extensions
permalink: /refs/rest-extensions/
---

# REST Extensions

The core of DHF runs on MarkLogic. This code is exposed to clients as REST API extensions, which include both *transforms* and *service extensions*. These extensions work identically to other [REST API Extensions](https://docs.marklogic.com/guide/rest-dev/extensions) except that they are provided out-of-the-box for DHF use.

The list of extensions comprising DHF are as follows:

- Transforms

| Extension name            | Implementing module name |
| --------------------------|--------------------------|
| ml:extractContent         | get-content |
| ml:inputFlow              | run-flow |
| ml:sjsInputFlow           | run-sjs-flow |
| ml:jobSearchResults       | job-search |
| ml:traceSearchResults     | trace-search |
| ml:traceUISearchResults   | trace-json |
| ml:prettifyXML            | prettify |
{:.table-b1gray}

- Service extensions

| Extension name            | Implementing module name |
|---------------------------|--------------------------|
| ml:dbConfigs              | db-configs |
| ml:debug                  | debug |
| ml:deleteJobs             | delete-jobs |
| ml:entity                 | entity |
| ml:flow                   | flow |
| ml:sjsFlow                | sjsflow |
| ml:hubstats               | hubstats |
| ml:hubversion             | hubversion |
| ml:piiGenerator           | pii-generator |
| ml:scaffoldContent        | scaffold-content |
| ml:searchOptionsGenerator | search-options-generator |
| ml:tracing                | tracing |
| ml:validate               | validate |
{:.table-b1gray}
