---
layout: inner
title: Harmonize with the REST API
permalink: /harmonize/rest/
---

## Harmonizing via REST

There are cases where you don't want to run Harmonize Flows in Batches. Perhaps you already know the id or uri that you would pass to the flow and want to skip the Collector.

When the DHF library runs a flow it first calls the collector to get a list of strings to operate on. Once it has the list it then splits these up into batches and calls a custom REST extension that invokes the main.(xqy\|sjs) for your flow.

You can skip the collector part and manually invoke a **Harmonize** flow via the flow Rest extension.

To do this send a POST Http Request to invoke a Harmonize flow with a given list of identifiers.


### Via HTTP

```
POST /v1/resources/flow?rs:identifiers=someIdentifier&rs:entity-name=EntityName&rs:flow-name=FlowName&rs:target-database=Documents&rs:options={"some":"json"}&rs:job-id=SomeJobID
```

#### The parameters are:
- **rs:identifiers** - the identifier of the document(s) to operate on. Pass this parameter multiple times for > 1 identifier.
- **rs:entity-name** - the name of the entity the flow belongs to
- **rs:flow-name** - the name of the flow
- **rs:target-database** - the name of the target database
- **rs:options** - a json object with key/value pairs
- **rs:job-id** - a job id. any string is legit

### Via Java Client API

**FlowResource.java**

```java
class FlowResource extends ResourceManager {
    static final public String NAME = "flow";

    private DatabaseClient srcClient;
    private String targetDatabase;
    private Flow flow;

    public FlowResource(DatabaseClient srcClient, String targetDatabase, Flow flow) {
        super();
        this.flow = flow;
        this.srcClient = srcClient;
        this.targetDatabase = targetDatabase;
        this.srcClient.init(NAME, this);
    }

    public RunFlowResponse run(String jobId, String item, Map<String, Object> options) {
        RunFlowResponse resp;
        try {
            RequestParameters params = new RequestParameters();
            params.add("entity-name", flow.getEntityName());
            params.add("flow-name", flow.getName());
            params.put("job-id", jobId);
            // note that the identifiers parameter is actually an array of strings
            params.put("identifiers", [item]);
            params.put("target-database", targetDatabase);
            if (options != null) {
                ObjectMapper objectMapper = new ObjectMapper();
                params.put("options", objectMapper.writeValueAsString(options));
            }
            StringHandle handle = new StringHandle("{}").withFormat(Format.JSON);
            ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, handle);
            if (resultItr == null || ! resultItr.hasNext()) {
                resp = new RunFlowResponse();
            }
            else {
                ResourceServices.ServiceResult res = resultItr.next();
                StringHandle handle = new StringHandle();
                ObjectMapper objectMapper = new ObjectMapper();
                resp = objectMapper.readValue(res.getContent(handle).get(), RunFlowResponse.class);
            }

        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
        return resp;
    }
}
```

Now Run it:

```java
import java.util.*;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.*;

// get a hub config
HubConfig dataHubConfig = HubConfig.hubFromEnvironment("/path/to/your/project", "local");

// get a flow manager
FlowManager flowManager = new FlowManager(dataHubConfig);

// retrieve the flow you wish to run
Flow harmonizeFlow = flowManager.getFlow("my entity name", "my flow name", FlowType.HARMONIZE);

// create an instance of FlowResource to run.
FlowResource flowResource = new FlowResource(databaseClient, "data-hub-FINAL", flow);

Map<String, Object> options = new HashMap<>();
flowResource.run(jobId, "yourIdentifier", options);
```
