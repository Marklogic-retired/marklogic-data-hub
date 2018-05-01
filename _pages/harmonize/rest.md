---
layout: inner
title: Harmonize with the REST API
permalink: /harmonize/rest/
---

### Harmonizing via REST

There are cases where you don't want to run harmonize flows in batches. Perhaps you already know the id or uri to pass to the flow and want to skip the collector.

When the DHF library runs a flow, it first calls the collector to get a list of strings to operate on. Once it has the list, it then splits the strings into batches and calls a custom REST extension that invokes the main.(xqy\|sjs) for your flow.

You can skip the collector phase and go to the harmonize phase by invoking the REST Client API "flow" extension that gets installed when you set up DHF. To use the extension, send a POST HTTP request to /LATEST/resources/flow.

#### Via HTTP

```
POST /v1/resources/flow?rs:identifiers=someIdentifier&rs:entity-name=EntityName&rs:flow-name=FlowName&rs:target-database=Documents&rs:options={"some":"json"}&rs:job-id=SomeJobID
```

The parameters are the following:

- **rs:identifiers** - the identifier of the document(s) to operate on. Pass this parameter multiple times for multiple identifiers.
- **rs:entity-name** - the name of the entity to which the flow belongs.
- **rs:flow-name** - the name of the flow.
- **rs:target-database** - the name of the target database.
- **rs:options** -  additional JSON options you can pass to the flow. Must be a JSON object.
- **rs:job-id** - a job id, any string is OK.

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

Now run it:

```java
import java.util.*;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubConfigBuilder;
import com.marklogic.hub.flow.*;

// get a hub config
HubConfig dataHubConfig = HubConfigBuilder.newHubConfigBuilder("/path/to/your/project")
    .withPropertiesFromEnvironment("local")
    .build();

// get a flow manager
FlowManager flowManager = new FlowManager(dataHubConfig);

// retrieve the flow you wish to run
Flow harmonizeFlow = flowManager.getFlow("my entity name", "my flow name", FlowType.HARMONIZE);

// create an instance of FlowResource to run.
FlowResource flowResource = new FlowResource(databaseClient, "data-hub-FINAL", flow);

Map<String, Object> options = new HashMap<>();
flowResource.run(jobId, "yourIdentifier", options);
```
