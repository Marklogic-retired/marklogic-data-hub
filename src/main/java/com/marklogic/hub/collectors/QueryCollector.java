package com.marklogic.hub.collectors;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.Collector;

@JsonInclude(Include.NON_NULL)
public class QueryCollector extends Collector {
    public QueryCollector(StructuredQueryDefinition query) {
        this.module = "query-collector";
        this.options = new QueryCollectorOptions(query);
    }

    @JsonInclude(Include.NON_NULL)
    public static class QueryCollectorOptions {
        private StructuredQueryDefinition query;

        public QueryCollectorOptions(StructuredQueryDefinition query) {
            this.query = query;
        }

        // this forces the query to serialize as XML
        public String getQuery() {
            return query.serialize();
        }
    }
}
