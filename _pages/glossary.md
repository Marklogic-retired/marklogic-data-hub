---
layout: inner
title: Glossary
permalink: /glossary/
---

## Data Hub Framework (DHF) Glossary

### Entities
:	XML or JSON representations of high-level business objects in your enterprise. Examples of business objects are employee, product, purchase order, and department.
	*See also: [Envelope Pattern - Entities](/understanding/how-it-works/#entities)*

### Entity Services
:	An out-of-the-box API and a set of conventions you can use within MarkLogic to quickly set up an application based on entity modeling.

### Envelope
:	A set of metadata wrapped around the original entity/data, including harmonized parts of the entity.
	*See also: [Envelope Pattern](/understanding/how-it-works/) and [Envelope Design Pattern (developer.marklogic.com)](https://developer.marklogic.com/blog/envelope-design-pattern)*

### Flow
:	A series of actions that process the data. Flows are implemented using a chain of plugins that perform sequential or concurrent steps in the process. The two types of flows are input and harmonize. *See also: [Envelope Pattern - Flows and Plugins](/understanding/how-it-works/#flows-and-plugins)*

### Flow tracing
:	The process that logs information about the flows as they run. Inputs to and outputs from every plugin of every flow are recorded into the JOBS database. *See also: [Flow Tracing](/understanding/flowtracing/)*

### Harmonization
: 	The DHF process of creating a canonical model of your data using only the parts you need and leaving the rest as-is.

### Harmonize flow
:	The type of flow that creates a canonical model of your data using only the parts you need and leaving the rest as-is. The harmonize flow is the most common type of flows in DHF and is typically run in batches. 
	*See also: [Envelope Pattern - Harmonize Flows](/understanding/how-it-works/#harmonize-flows)*

### Ingestion	
:	The DHF process that uses an input flow to pull documents into the Data Hub.
	
### Input flow
:	The type of flow that processes each incoming document before it is written into MarkLogic. Input flows are invoked by the MarkLogic Content Pump (MLCP), the Java Client API, or the REST Client API.
	*See also: [Envelope Pattern - Input Flows](/understanding/how-it-works/#input-flows)*

### Provenance and Lineage
:	The DHF process that ensures that the data can be traced back to its origin and that the source data is preserved.

