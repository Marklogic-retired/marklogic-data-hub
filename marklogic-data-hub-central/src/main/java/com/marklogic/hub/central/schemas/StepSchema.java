
package com.marklogic.hub.central.schemas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonValue;


/**
 * Step
 * <p>
 * 
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "processors",
    "customHook",
    "threadCount",
    "batchSize",
    "stepDefinitionType",
    "stepDefinitionName",
    "description",
    "stepId",
    "headers",
    "additionalSettings",
    "validateEntity",
    "targetDatabase",
    "sourceDatabase",
    "outputFormat",
    "permissions",
    "collections",
    "additionalCollections",
    "acceptsBatch",
    "stepUpdate",
    "provenanceGranularityLevel",
    "constrainSourceQueryToJob",
    "sourceQueryIsScript",
    "sourceQuery",
    "excludeAlreadyProcessed",
    "targetEntityType",
    "name"
})
public class StepSchema {

    @JsonProperty("processors")
    private List<Processor> processors = new ArrayList<Processor>();
    /**
     * CustomHook
     * <p>
     * 
     * 
     */
    @JsonProperty("customHook")
    private CustomHookSchema customHook;
    /**
     * If set, overrides the threadCount defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("threadCount")
    @JsonPropertyDescription("If set, overrides the threadCount defined at the flow level and in the step definition")
    private Integer threadCount;
    /**
     * If set, overrides the batchSize defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("batchSize")
    @JsonPropertyDescription("If set, overrides the batchSize defined at the flow level and in the step definition")
    private Integer batchSize;
    @JsonProperty("stepDefinitionType")
    private String stepDefinitionType;
    @JsonProperty("stepDefinitionName")
    private String stepDefinitionName;
    /**
     * Optional description fo the step
     * 
     */
    @JsonProperty("description")
    @JsonPropertyDescription("Optional description fo the step")
    private String description;
    /**
     * This is generated on the server-side
     * 
     */
    @JsonProperty("stepId")
    @JsonPropertyDescription("This is generated on the server-side")
    private String stepId;
    /**
     * Any properties in this object will be copied into the headers of each document processed by the step
     * 
     */
    @JsonProperty("headers")
    @JsonPropertyDescription("Any properties in this object will be copied into the headers of each document processed by the step")
    private Headers__1 headers;
    /**
     * Non-DataHub options set by users; used only in UI in custom steps currently
     * 
     */
    @JsonProperty("additionalSettings")
    @JsonPropertyDescription("Non-DataHub options set by users; used only in UI in custom steps currently")
    private AdditionalSettings additionalSettings;
    /**
     * Applicable to mapping steps only
     * 
     */
    @JsonProperty("validateEntity")
    @JsonPropertyDescription("Applicable to mapping steps only")
    private String validateEntity;
    @JsonProperty("targetDatabase")
    private String targetDatabase;
    @JsonProperty("sourceDatabase")
    private String sourceDatabase;
    @JsonProperty("outputFormat")
    private StepSchema.OutputFormat outputFormat;
    /**
     * Comma-delimited string of role,capability,role,capability,etc
     * 
     */
    @JsonProperty("permissions")
    @JsonPropertyDescription("Comma-delimited string of role,capability,role,capability,etc")
    private String permissions;
    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("collections")
    @JsonPropertyDescription("additional collections provided by the user that get applied to the step output")
    private List<String> collections = new ArrayList<String>();
    /**
     * default collections associated with a step that are applied to the step output
     * 
     */
    @JsonProperty("additionalCollections")
    @JsonPropertyDescription("default collections associated with a step that are applied to the step output")
    private List<String> additionalCollections = new ArrayList<String>();
    /**
     * If true, the step module is invoked once with all records in the batch passed to it
     * 
     */
    @JsonProperty("acceptsBatch")
    @JsonPropertyDescription("If true, the step module is invoked once with all records in the batch passed to it")
    private Boolean acceptsBatch = false;
    /**
     * If true, custom modules can make changes directly to records in the database
     * 
     */
    @JsonProperty("stepUpdate")
    @JsonPropertyDescription("If true, custom modules can make changes directly to records in the database")
    private Boolean stepUpdate = false;
    /**
     * The granularity of the provenance tracking information: coarse (default) to store document-level provenance information only, fine to store document-level and property-level provenance information, or off to disable provenance tracking in future job runs. Applies only to mapping, matching, merging, mastering, and custom steps.
     * 
     */
    @JsonProperty("provenanceGranularityLevel")
    @JsonPropertyDescription("The granularity of the provenance tracking information: coarse (default) to store document-level provenance information only, fine to store document-level and property-level provenance information, or off to disable provenance tracking in future job runs. Applies only to mapping, matching, merging, mastering, and custom steps.")
    private StepSchema.ProvenanceGranularityLevel provenanceGranularityLevel;
    /**
     * If true, the query is applied to the documents that were created or modified in the same job that executes the step
     * 
     */
    @JsonProperty("constrainSourceQueryToJob")
    @JsonPropertyDescription("If true, the query is applied to the documents that were created or modified in the same job that executes the step")
    private Boolean constrainSourceQueryToJob;
    /**
     * Added in 5.3.0; if true, then sourceQuery can be any JavaScript statement that can be passed into xdmp.eval
     * 
     */
    @JsonProperty("sourceQueryIsScript")
    @JsonPropertyDescription("Added in 5.3.0; if true, then sourceQuery can be any JavaScript statement that can be passed into xdmp.eval")
    private Boolean sourceQueryIsScript;
    /**
     * Defines the items to be processed by the step; must be a cts.query or cts.uris statement if sourceQueryIsScript is false
     * 
     */
    @JsonProperty("sourceQuery")
    @JsonPropertyDescription("Defines the items to be processed by the step; must be a cts.query or cts.uris statement if sourceQueryIsScript is false")
    private String sourceQuery;
    /**
     * Added in 5.4.0; if true, then any items returned by the sourceQuery will be excluded from processing if a Batch document indicates that the item was processed by this step already
     * 
     */
    @JsonProperty("excludeAlreadyProcessed")
    @JsonPropertyDescription("Added in 5.4.0; if true, then any items returned by the sourceQuery will be excluded from processing if a Batch document indicates that the item was processed by this step already")
    private Boolean excludeAlreadyProcessed;
    /**
     * The identifier of an Entity Type. (IRI, with title as fallback)
     * 
     */
    @JsonProperty("targetEntityType")
    @JsonPropertyDescription("The identifier of an Entity Type. (IRI, with title as fallback)")
    private String targetEntityType;
    @JsonProperty("name")
    private String name;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("processors")
    public List<Processor> getProcessors() {
        return processors;
    }

    @JsonProperty("processors")
    public void setProcessors(List<Processor> processors) {
        this.processors = processors;
    }

    /**
     * CustomHook
     * <p>
     * 
     * 
     */
    @JsonProperty("customHook")
    public CustomHookSchema getCustomHook() {
        return customHook;
    }

    /**
     * CustomHook
     * <p>
     * 
     * 
     */
    @JsonProperty("customHook")
    public void setCustomHook(CustomHookSchema customHook) {
        this.customHook = customHook;
    }

    /**
     * If set, overrides the threadCount defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("threadCount")
    public Integer getThreadCount() {
        return threadCount;
    }

    /**
     * If set, overrides the threadCount defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("threadCount")
    public void setThreadCount(Integer threadCount) {
        this.threadCount = threadCount;
    }

    /**
     * If set, overrides the batchSize defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("batchSize")
    public Integer getBatchSize() {
        return batchSize;
    }

    /**
     * If set, overrides the batchSize defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("batchSize")
    public void setBatchSize(Integer batchSize) {
        this.batchSize = batchSize;
    }

    @JsonProperty("stepDefinitionType")
    public String getStepDefinitionType() {
        return stepDefinitionType;
    }

    @JsonProperty("stepDefinitionType")
    public void setStepDefinitionType(String stepDefinitionType) {
        this.stepDefinitionType = stepDefinitionType;
    }

    @JsonProperty("stepDefinitionName")
    public String getStepDefinitionName() {
        return stepDefinitionName;
    }

    @JsonProperty("stepDefinitionName")
    public void setStepDefinitionName(String stepDefinitionName) {
        this.stepDefinitionName = stepDefinitionName;
    }

    /**
     * Optional description fo the step
     * 
     */
    @JsonProperty("description")
    public String getDescription() {
        return description;
    }

    /**
     * Optional description fo the step
     * 
     */
    @JsonProperty("description")
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * This is generated on the server-side
     * 
     */
    @JsonProperty("stepId")
    public String getStepId() {
        return stepId;
    }

    /**
     * This is generated on the server-side
     * 
     */
    @JsonProperty("stepId")
    public void setStepId(String stepId) {
        this.stepId = stepId;
    }

    /**
     * Any properties in this object will be copied into the headers of each document processed by the step
     * 
     */
    @JsonProperty("headers")
    public Headers__1 getHeaders() {
        return headers;
    }

    /**
     * Any properties in this object will be copied into the headers of each document processed by the step
     * 
     */
    @JsonProperty("headers")
    public void setHeaders(Headers__1 headers) {
        this.headers = headers;
    }

    /**
     * Non-DataHub options set by users; used only in UI in custom steps currently
     * 
     */
    @JsonProperty("additionalSettings")
    public AdditionalSettings getAdditionalSettings() {
        return additionalSettings;
    }

    /**
     * Non-DataHub options set by users; used only in UI in custom steps currently
     * 
     */
    @JsonProperty("additionalSettings")
    public void setAdditionalSettings(AdditionalSettings additionalSettings) {
        this.additionalSettings = additionalSettings;
    }

    /**
     * Applicable to mapping steps only
     * 
     */
    @JsonProperty("validateEntity")
    public String getValidateEntity() {
        return validateEntity;
    }

    /**
     * Applicable to mapping steps only
     * 
     */
    @JsonProperty("validateEntity")
    public void setValidateEntity(String validateEntity) {
        this.validateEntity = validateEntity;
    }

    @JsonProperty("targetDatabase")
    public String getTargetDatabase() {
        return targetDatabase;
    }

    @JsonProperty("targetDatabase")
    public void setTargetDatabase(String targetDatabase) {
        this.targetDatabase = targetDatabase;
    }

    @JsonProperty("sourceDatabase")
    public String getSourceDatabase() {
        return sourceDatabase;
    }

    @JsonProperty("sourceDatabase")
    public void setSourceDatabase(String sourceDatabase) {
        this.sourceDatabase = sourceDatabase;
    }

    @JsonProperty("outputFormat")
    public StepSchema.OutputFormat getOutputFormat() {
        return outputFormat;
    }

    @JsonProperty("outputFormat")
    public void setOutputFormat(StepSchema.OutputFormat outputFormat) {
        this.outputFormat = outputFormat;
    }

    /**
     * Comma-delimited string of role,capability,role,capability,etc
     * 
     */
    @JsonProperty("permissions")
    public String getPermissions() {
        return permissions;
    }

    /**
     * Comma-delimited string of role,capability,role,capability,etc
     * 
     */
    @JsonProperty("permissions")
    public void setPermissions(String permissions) {
        this.permissions = permissions;
    }

    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("collections")
    public List<String> getCollections() {
        return collections;
    }

    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("collections")
    public void setCollections(List<String> collections) {
        this.collections = collections;
    }

    /**
     * default collections associated with a step that are applied to the step output
     * 
     */
    @JsonProperty("additionalCollections")
    public List<String> getAdditionalCollections() {
        return additionalCollections;
    }

    /**
     * default collections associated with a step that are applied to the step output
     * 
     */
    @JsonProperty("additionalCollections")
    public void setAdditionalCollections(List<String> additionalCollections) {
        this.additionalCollections = additionalCollections;
    }

    /**
     * If true, the step module is invoked once with all records in the batch passed to it
     * 
     */
    @JsonProperty("acceptsBatch")
    public Boolean getAcceptsBatch() {
        return acceptsBatch;
    }

    /**
     * If true, the step module is invoked once with all records in the batch passed to it
     * 
     */
    @JsonProperty("acceptsBatch")
    public void setAcceptsBatch(Boolean acceptsBatch) {
        this.acceptsBatch = acceptsBatch;
    }

    /**
     * If true, custom modules can make changes directly to records in the database
     * 
     */
    @JsonProperty("stepUpdate")
    public Boolean getStepUpdate() {
        return stepUpdate;
    }

    /**
     * If true, custom modules can make changes directly to records in the database
     * 
     */
    @JsonProperty("stepUpdate")
    public void setStepUpdate(Boolean stepUpdate) {
        this.stepUpdate = stepUpdate;
    }

    /**
     * The granularity of the provenance tracking information: coarse (default) to store document-level provenance information only, fine to store document-level and property-level provenance information, or off to disable provenance tracking in future job runs. Applies only to mapping, matching, merging, mastering, and custom steps.
     * 
     */
    @JsonProperty("provenanceGranularityLevel")
    public StepSchema.ProvenanceGranularityLevel getProvenanceGranularityLevel() {
        return provenanceGranularityLevel;
    }

    /**
     * The granularity of the provenance tracking information: coarse (default) to store document-level provenance information only, fine to store document-level and property-level provenance information, or off to disable provenance tracking in future job runs. Applies only to mapping, matching, merging, mastering, and custom steps.
     * 
     */
    @JsonProperty("provenanceGranularityLevel")
    public void setProvenanceGranularityLevel(StepSchema.ProvenanceGranularityLevel provenanceGranularityLevel) {
        this.provenanceGranularityLevel = provenanceGranularityLevel;
    }

    /**
     * If true, the query is applied to the documents that were created or modified in the same job that executes the step
     * 
     */
    @JsonProperty("constrainSourceQueryToJob")
    public Boolean getConstrainSourceQueryToJob() {
        return constrainSourceQueryToJob;
    }

    /**
     * If true, the query is applied to the documents that were created or modified in the same job that executes the step
     * 
     */
    @JsonProperty("constrainSourceQueryToJob")
    public void setConstrainSourceQueryToJob(Boolean constrainSourceQueryToJob) {
        this.constrainSourceQueryToJob = constrainSourceQueryToJob;
    }

    /**
     * Added in 5.3.0; if true, then sourceQuery can be any JavaScript statement that can be passed into xdmp.eval
     * 
     */
    @JsonProperty("sourceQueryIsScript")
    public Boolean getSourceQueryIsScript() {
        return sourceQueryIsScript;
    }

    /**
     * Added in 5.3.0; if true, then sourceQuery can be any JavaScript statement that can be passed into xdmp.eval
     * 
     */
    @JsonProperty("sourceQueryIsScript")
    public void setSourceQueryIsScript(Boolean sourceQueryIsScript) {
        this.sourceQueryIsScript = sourceQueryIsScript;
    }

    /**
     * Defines the items to be processed by the step; must be a cts.query or cts.uris statement if sourceQueryIsScript is false
     * 
     */
    @JsonProperty("sourceQuery")
    public String getSourceQuery() {
        return sourceQuery;
    }

    /**
     * Defines the items to be processed by the step; must be a cts.query or cts.uris statement if sourceQueryIsScript is false
     * 
     */
    @JsonProperty("sourceQuery")
    public void setSourceQuery(String sourceQuery) {
        this.sourceQuery = sourceQuery;
    }

    /**
     * Added in 5.4.0; if true, then any items returned by the sourceQuery will be excluded from processing if a Batch document indicates that the item was processed by this step already
     * 
     */
    @JsonProperty("excludeAlreadyProcessed")
    public Boolean getExcludeAlreadyProcessed() {
        return excludeAlreadyProcessed;
    }

    /**
     * Added in 5.4.0; if true, then any items returned by the sourceQuery will be excluded from processing if a Batch document indicates that the item was processed by this step already
     * 
     */
    @JsonProperty("excludeAlreadyProcessed")
    public void setExcludeAlreadyProcessed(Boolean excludeAlreadyProcessed) {
        this.excludeAlreadyProcessed = excludeAlreadyProcessed;
    }

    /**
     * The identifier of an Entity Type. (IRI, with title as fallback)
     * 
     */
    @JsonProperty("targetEntityType")
    public String getTargetEntityType() {
        return targetEntityType;
    }

    /**
     * The identifier of an Entity Type. (IRI, with title as fallback)
     * 
     */
    @JsonProperty("targetEntityType")
    public void setTargetEntityType(String targetEntityType) {
        this.targetEntityType = targetEntityType;
    }

    @JsonProperty("name")
    public String getName() {
        return name;
    }

    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
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
        sb.append(StepSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("processors");
        sb.append('=');
        sb.append(((this.processors == null)?"<null>":this.processors));
        sb.append(',');
        sb.append("customHook");
        sb.append('=');
        sb.append(((this.customHook == null)?"<null>":this.customHook));
        sb.append(',');
        sb.append("threadCount");
        sb.append('=');
        sb.append(((this.threadCount == null)?"<null>":this.threadCount));
        sb.append(',');
        sb.append("batchSize");
        sb.append('=');
        sb.append(((this.batchSize == null)?"<null>":this.batchSize));
        sb.append(',');
        sb.append("stepDefinitionType");
        sb.append('=');
        sb.append(((this.stepDefinitionType == null)?"<null>":this.stepDefinitionType));
        sb.append(',');
        sb.append("stepDefinitionName");
        sb.append('=');
        sb.append(((this.stepDefinitionName == null)?"<null>":this.stepDefinitionName));
        sb.append(',');
        sb.append("description");
        sb.append('=');
        sb.append(((this.description == null)?"<null>":this.description));
        sb.append(',');
        sb.append("stepId");
        sb.append('=');
        sb.append(((this.stepId == null)?"<null>":this.stepId));
        sb.append(',');
        sb.append("headers");
        sb.append('=');
        sb.append(((this.headers == null)?"<null>":this.headers));
        sb.append(',');
        sb.append("additionalSettings");
        sb.append('=');
        sb.append(((this.additionalSettings == null)?"<null>":this.additionalSettings));
        sb.append(',');
        sb.append("validateEntity");
        sb.append('=');
        sb.append(((this.validateEntity == null)?"<null>":this.validateEntity));
        sb.append(',');
        sb.append("targetDatabase");
        sb.append('=');
        sb.append(((this.targetDatabase == null)?"<null>":this.targetDatabase));
        sb.append(',');
        sb.append("sourceDatabase");
        sb.append('=');
        sb.append(((this.sourceDatabase == null)?"<null>":this.sourceDatabase));
        sb.append(',');
        sb.append("outputFormat");
        sb.append('=');
        sb.append(((this.outputFormat == null)?"<null>":this.outputFormat));
        sb.append(',');
        sb.append("permissions");
        sb.append('=');
        sb.append(((this.permissions == null)?"<null>":this.permissions));
        sb.append(',');
        sb.append("collections");
        sb.append('=');
        sb.append(((this.collections == null)?"<null>":this.collections));
        sb.append(',');
        sb.append("additionalCollections");
        sb.append('=');
        sb.append(((this.additionalCollections == null)?"<null>":this.additionalCollections));
        sb.append(',');
        sb.append("acceptsBatch");
        sb.append('=');
        sb.append(((this.acceptsBatch == null)?"<null>":this.acceptsBatch));
        sb.append(',');
        sb.append("stepUpdate");
        sb.append('=');
        sb.append(((this.stepUpdate == null)?"<null>":this.stepUpdate));
        sb.append(',');
        sb.append("provenanceGranularityLevel");
        sb.append('=');
        sb.append(((this.provenanceGranularityLevel == null)?"<null>":this.provenanceGranularityLevel));
        sb.append(',');
        sb.append("constrainSourceQueryToJob");
        sb.append('=');
        sb.append(((this.constrainSourceQueryToJob == null)?"<null>":this.constrainSourceQueryToJob));
        sb.append(',');
        sb.append("sourceQueryIsScript");
        sb.append('=');
        sb.append(((this.sourceQueryIsScript == null)?"<null>":this.sourceQueryIsScript));
        sb.append(',');
        sb.append("sourceQuery");
        sb.append('=');
        sb.append(((this.sourceQuery == null)?"<null>":this.sourceQuery));
        sb.append(',');
        sb.append("excludeAlreadyProcessed");
        sb.append('=');
        sb.append(((this.excludeAlreadyProcessed == null)?"<null>":this.excludeAlreadyProcessed));
        sb.append(',');
        sb.append("targetEntityType");
        sb.append('=');
        sb.append(((this.targetEntityType == null)?"<null>":this.targetEntityType));
        sb.append(',');
        sb.append("name");
        sb.append('=');
        sb.append(((this.name == null)?"<null>":this.name));
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
        result = ((result* 31)+((this.stepUpdate == null)? 0 :this.stepUpdate.hashCode()));
        result = ((result* 31)+((this.sourceQuery == null)? 0 :this.sourceQuery.hashCode()));
        result = ((result* 31)+((this.provenanceGranularityLevel == null)? 0 :this.provenanceGranularityLevel.hashCode()));
        result = ((result* 31)+((this.acceptsBatch == null)? 0 :this.acceptsBatch.hashCode()));
        result = ((result* 31)+((this.customHook == null)? 0 :this.customHook.hashCode()));
        result = ((result* 31)+((this.validateEntity == null)? 0 :this.validateEntity.hashCode()));
        result = ((result* 31)+((this.stepId == null)? 0 :this.stepId.hashCode()));
        result = ((result* 31)+((this.description == null)? 0 :this.description.hashCode()));
        result = ((result* 31)+((this.processors == null)? 0 :this.processors.hashCode()));
        result = ((result* 31)+((this.sourceDatabase == null)? 0 :this.sourceDatabase.hashCode()));
        result = ((result* 31)+((this.collections == null)? 0 :this.collections.hashCode()));
        result = ((result* 31)+((this.permissions == null)? 0 :this.permissions.hashCode()));
        result = ((result* 31)+((this.additionalSettings == null)? 0 :this.additionalSettings.hashCode()));
        result = ((result* 31)+((this.stepDefinitionName == null)? 0 :this.stepDefinitionName.hashCode()));
        result = ((result* 31)+((this.outputFormat == null)? 0 :this.outputFormat.hashCode()));
        result = ((result* 31)+((this.additionalCollections == null)? 0 :this.additionalCollections.hashCode()));
        result = ((result* 31)+((this.headers == null)? 0 :this.headers.hashCode()));
        result = ((result* 31)+((this.threadCount == null)? 0 :this.threadCount.hashCode()));
        result = ((result* 31)+((this.stepDefinitionType == null)? 0 :this.stepDefinitionType.hashCode()));
        result = ((result* 31)+((this.constrainSourceQueryToJob == null)? 0 :this.constrainSourceQueryToJob.hashCode()));
        result = ((result* 31)+((this.targetDatabase == null)? 0 :this.targetDatabase.hashCode()));
        result = ((result* 31)+((this.sourceQueryIsScript == null)? 0 :this.sourceQueryIsScript.hashCode()));
        result = ((result* 31)+((this.targetEntityType == null)? 0 :this.targetEntityType.hashCode()));
        result = ((result* 31)+((this.name == null)? 0 :this.name.hashCode()));
        result = ((result* 31)+((this.excludeAlreadyProcessed == null)? 0 :this.excludeAlreadyProcessed.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.batchSize == null)? 0 :this.batchSize.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof StepSchema) == false) {
            return false;
        }
        StepSchema rhs = ((StepSchema) other);
        return ((((((((((((((((((((((((((((this.stepUpdate == rhs.stepUpdate)||((this.stepUpdate!= null)&&this.stepUpdate.equals(rhs.stepUpdate)))&&((this.sourceQuery == rhs.sourceQuery)||((this.sourceQuery!= null)&&this.sourceQuery.equals(rhs.sourceQuery))))&&((this.provenanceGranularityLevel == rhs.provenanceGranularityLevel)||((this.provenanceGranularityLevel!= null)&&this.provenanceGranularityLevel.equals(rhs.provenanceGranularityLevel))))&&((this.acceptsBatch == rhs.acceptsBatch)||((this.acceptsBatch!= null)&&this.acceptsBatch.equals(rhs.acceptsBatch))))&&((this.customHook == rhs.customHook)||((this.customHook!= null)&&this.customHook.equals(rhs.customHook))))&&((this.validateEntity == rhs.validateEntity)||((this.validateEntity!= null)&&this.validateEntity.equals(rhs.validateEntity))))&&((this.stepId == rhs.stepId)||((this.stepId!= null)&&this.stepId.equals(rhs.stepId))))&&((this.description == rhs.description)||((this.description!= null)&&this.description.equals(rhs.description))))&&((this.processors == rhs.processors)||((this.processors!= null)&&this.processors.equals(rhs.processors))))&&((this.sourceDatabase == rhs.sourceDatabase)||((this.sourceDatabase!= null)&&this.sourceDatabase.equals(rhs.sourceDatabase))))&&((this.collections == rhs.collections)||((this.collections!= null)&&this.collections.equals(rhs.collections))))&&((this.permissions == rhs.permissions)||((this.permissions!= null)&&this.permissions.equals(rhs.permissions))))&&((this.additionalSettings == rhs.additionalSettings)||((this.additionalSettings!= null)&&this.additionalSettings.equals(rhs.additionalSettings))))&&((this.stepDefinitionName == rhs.stepDefinitionName)||((this.stepDefinitionName!= null)&&this.stepDefinitionName.equals(rhs.stepDefinitionName))))&&((this.outputFormat == rhs.outputFormat)||((this.outputFormat!= null)&&this.outputFormat.equals(rhs.outputFormat))))&&((this.additionalCollections == rhs.additionalCollections)||((this.additionalCollections!= null)&&this.additionalCollections.equals(rhs.additionalCollections))))&&((this.headers == rhs.headers)||((this.headers!= null)&&this.headers.equals(rhs.headers))))&&((this.threadCount == rhs.threadCount)||((this.threadCount!= null)&&this.threadCount.equals(rhs.threadCount))))&&((this.stepDefinitionType == rhs.stepDefinitionType)||((this.stepDefinitionType!= null)&&this.stepDefinitionType.equals(rhs.stepDefinitionType))))&&((this.constrainSourceQueryToJob == rhs.constrainSourceQueryToJob)||((this.constrainSourceQueryToJob!= null)&&this.constrainSourceQueryToJob.equals(rhs.constrainSourceQueryToJob))))&&((this.targetDatabase == rhs.targetDatabase)||((this.targetDatabase!= null)&&this.targetDatabase.equals(rhs.targetDatabase))))&&((this.sourceQueryIsScript == rhs.sourceQueryIsScript)||((this.sourceQueryIsScript!= null)&&this.sourceQueryIsScript.equals(rhs.sourceQueryIsScript))))&&((this.targetEntityType == rhs.targetEntityType)||((this.targetEntityType!= null)&&this.targetEntityType.equals(rhs.targetEntityType))))&&((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name))))&&((this.excludeAlreadyProcessed == rhs.excludeAlreadyProcessed)||((this.excludeAlreadyProcessed!= null)&&this.excludeAlreadyProcessed.equals(rhs.excludeAlreadyProcessed))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.batchSize == rhs.batchSize)||((this.batchSize!= null)&&this.batchSize.equals(rhs.batchSize))));
    }

    public enum OutputFormat {

        JSON("json"),
        XML("xml");
        private final String value;
        private final static Map<String, StepSchema.OutputFormat> CONSTANTS = new HashMap<String, StepSchema.OutputFormat>();

        static {
            for (StepSchema.OutputFormat c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        private OutputFormat(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        @JsonValue
        public String value() {
            return this.value;
        }

        @JsonCreator
        public static StepSchema.OutputFormat fromValue(String value) {
            StepSchema.OutputFormat constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }


    /**
     * The granularity of the provenance tracking information: coarse (default) to store document-level provenance information only, fine to store document-level and property-level provenance information, or off to disable provenance tracking in future job runs. Applies only to mapping, matching, merging, mastering, and custom steps.
     * 
     */
    public enum ProvenanceGranularityLevel {

        OFF("off"),
        COARSE("coarse"),
        FINE("fine");
        private final String value;
        private final static Map<String, StepSchema.ProvenanceGranularityLevel> CONSTANTS = new HashMap<String, StepSchema.ProvenanceGranularityLevel>();

        static {
            for (StepSchema.ProvenanceGranularityLevel c: values()) {
                CONSTANTS.put(c.value, c);
            }
        }

        private ProvenanceGranularityLevel(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        @JsonValue
        public String value() {
            return this.value;
        }

        @JsonCreator
        public static StepSchema.ProvenanceGranularityLevel fromValue(String value) {
            StepSchema.ProvenanceGranularityLevel constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
