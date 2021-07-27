
package com.marklogic.hub.central.schemas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.annotation.Generated;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;


/**
 * EntitySearchResponse
 * <p>
 * Defines a MarkLogic JSON search response that includes entity-specific data needed by the UI. Note that some things - like facets and matches - are explicitly omitted because they're already defined by the ML docs.
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "snippet-format",
    "total",
    "start",
    "page-length",
    "results",
    "selectedPropertyDefinitions",
    "entityPropertyDefinitions"
})
@Generated("jsonschema2pojo")
public class EntitySearchResponseSchema {

    @JsonProperty("snippet-format")
    private String snippetFormat;
    @JsonProperty("total")
    private Double total;
    @JsonProperty("start")
    private Double start;
    @JsonProperty("page-length")
    private Double pageLength;
    @JsonProperty("results")
    private List<EntitySearchResultSchema> results = new ArrayList<EntitySearchResultSchema>();
    /**
     * Defines the array of selected properties, which will either be a default set based on the entity type, or chosen by a client
     * 
     */
    @JsonProperty("selectedPropertyDefinitions")
    @JsonPropertyDescription("Defines the array of selected properties, which will either be a default set based on the entity type, or chosen by a client")
    private List<EntitySearchPropertyDefinitionSchema> selectedPropertyDefinitions = new ArrayList<EntitySearchPropertyDefinitionSchema>();
    /**
     * Defines the entire set of properties for an entity type, including structured properties
     * 
     */
    @JsonProperty("entityPropertyDefinitions")
    @JsonPropertyDescription("Defines the entire set of properties for an entity type, including structured properties")
    private List<EntitySearchPropertyDefinitionSchema> entityPropertyDefinitions = new ArrayList<EntitySearchPropertyDefinitionSchema>();
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("snippet-format")
    public String getSnippetFormat() {
        return snippetFormat;
    }

    @JsonProperty("snippet-format")
    public void setSnippetFormat(String snippetFormat) {
        this.snippetFormat = snippetFormat;
    }

    @JsonProperty("total")
    public Double getTotal() {
        return total;
    }

    @JsonProperty("total")
    public void setTotal(Double total) {
        this.total = total;
    }

    @JsonProperty("start")
    public Double getStart() {
        return start;
    }

    @JsonProperty("start")
    public void setStart(Double start) {
        this.start = start;
    }

    @JsonProperty("page-length")
    public Double getPageLength() {
        return pageLength;
    }

    @JsonProperty("page-length")
    public void setPageLength(Double pageLength) {
        this.pageLength = pageLength;
    }

    @JsonProperty("results")
    public List<EntitySearchResultSchema> getResults() {
        return results;
    }

    @JsonProperty("results")
    public void setResults(List<EntitySearchResultSchema> results) {
        this.results = results;
    }

    /**
     * Defines the array of selected properties, which will either be a default set based on the entity type, or chosen by a client
     * 
     */
    @JsonProperty("selectedPropertyDefinitions")
    public List<EntitySearchPropertyDefinitionSchema> getSelectedPropertyDefinitions() {
        return selectedPropertyDefinitions;
    }

    /**
     * Defines the array of selected properties, which will either be a default set based on the entity type, or chosen by a client
     * 
     */
    @JsonProperty("selectedPropertyDefinitions")
    public void setSelectedPropertyDefinitions(List<EntitySearchPropertyDefinitionSchema> selectedPropertyDefinitions) {
        this.selectedPropertyDefinitions = selectedPropertyDefinitions;
    }

    /**
     * Defines the entire set of properties for an entity type, including structured properties
     * 
     */
    @JsonProperty("entityPropertyDefinitions")
    public List<EntitySearchPropertyDefinitionSchema> getEntityPropertyDefinitions() {
        return entityPropertyDefinitions;
    }

    /**
     * Defines the entire set of properties for an entity type, including structured properties
     * 
     */
    @JsonProperty("entityPropertyDefinitions")
    public void setEntityPropertyDefinitions(List<EntitySearchPropertyDefinitionSchema> entityPropertyDefinitions) {
        this.entityPropertyDefinitions = entityPropertyDefinitions;
    }

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append(EntitySearchResponseSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("snippetFormat");
        sb.append('=');
        sb.append(((this.snippetFormat == null)?"<null>":this.snippetFormat));
        sb.append(',');
        sb.append("total");
        sb.append('=');
        sb.append(((this.total == null)?"<null>":this.total));
        sb.append(',');
        sb.append("start");
        sb.append('=');
        sb.append(((this.start == null)?"<null>":this.start));
        sb.append(',');
        sb.append("pageLength");
        sb.append('=');
        sb.append(((this.pageLength == null)?"<null>":this.pageLength));
        sb.append(',');
        sb.append("results");
        sb.append('=');
        sb.append(((this.results == null)?"<null>":this.results));
        sb.append(',');
        sb.append("selectedPropertyDefinitions");
        sb.append('=');
        sb.append(((this.selectedPropertyDefinitions == null)?"<null>":this.selectedPropertyDefinitions));
        sb.append(',');
        sb.append("entityPropertyDefinitions");
        sb.append('=');
        sb.append(((this.entityPropertyDefinitions == null)?"<null>":this.entityPropertyDefinitions));
        sb.append(',');
        sb.append("additionalProperties");
        sb.append('=');
        sb.append(((this.additionalProperties == null)?"<null>":this.additionalProperties));
        sb.append(',');
        if (sb.charAt((sb.length()- 1)) == ',') {
            sb.setCharAt((sb.length()- 1), ']');
        } else {
            sb.append(']');
        }
        return sb.toString();
    }

    @Override
    public int hashCode() {
        int result = 1;
        result = ((result* 31)+((this.entityPropertyDefinitions == null)? 0 :this.entityPropertyDefinitions.hashCode()));
        result = ((result* 31)+((this.total == null)? 0 :this.total.hashCode()));
        result = ((result* 31)+((this.pageLength == null)? 0 :this.pageLength.hashCode()));
        result = ((result* 31)+((this.start == null)? 0 :this.start.hashCode()));
        result = ((result* 31)+((this.snippetFormat == null)? 0 :this.snippetFormat.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.results == null)? 0 :this.results.hashCode()));
        result = ((result* 31)+((this.selectedPropertyDefinitions == null)? 0 :this.selectedPropertyDefinitions.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof EntitySearchResponseSchema) == false) {
            return false;
        }
        EntitySearchResponseSchema rhs = ((EntitySearchResponseSchema) other);
        return (((((((((this.entityPropertyDefinitions == rhs.entityPropertyDefinitions)||((this.entityPropertyDefinitions!= null)&&this.entityPropertyDefinitions.equals(rhs.entityPropertyDefinitions)))&&((this.total == rhs.total)||((this.total!= null)&&this.total.equals(rhs.total))))&&((this.pageLength == rhs.pageLength)||((this.pageLength!= null)&&this.pageLength.equals(rhs.pageLength))))&&((this.start == rhs.start)||((this.start!= null)&&this.start.equals(rhs.start))))&&((this.snippetFormat == rhs.snippetFormat)||((this.snippetFormat!= null)&&this.snippetFormat.equals(rhs.snippetFormat))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.results == rhs.results)||((this.results!= null)&&this.results.equals(rhs.results))))&&((this.selectedPropertyDefinitions == rhs.selectedPropertyDefinitions)||((this.selectedPropertyDefinitions!= null)&&this.selectedPropertyDefinitions.equals(rhs.selectedPropertyDefinitions))));
    }

}
