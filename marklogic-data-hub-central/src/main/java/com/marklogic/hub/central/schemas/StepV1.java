
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
    "validateEntity",
    "outputDatabase",
    "inputDatabase",
    "outputFormat",
    "outputPermissions",
    "outputCollections",
    "defaultOutputCollections",
    "acceptsBatch",
    "stepUpdate",
    "provenanceGranularityLevel",
    "constrainSourceQueryToJob",
    "sourceQueryIsScript",
    "sourceQuery",
    "targetEntityTypeId",
    "name"
})
public class StepV1 {

    @JsonProperty("processors")
    private List<Processor> processors = new ArrayList<Processor>();
    @JsonProperty("customHook")
    private CustomHook customHook;
    /**
     * If set, overrides the threadCount defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("threadCount")
    @JsonPropertyDescription("If set, overrides the threadCount defined at the flow level and in the step definition")
    private Double threadCount;
    /**
     * If set, overrides the batchSize defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("batchSize")
    @JsonPropertyDescription("If set, overrides the batchSize defined at the flow level and in the step definition")
    private Double batchSize;
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
    private Headers headers;
    /**
     * Applicable to mapping steps only
     * 
     */
    @JsonProperty("validateEntity")
    @JsonPropertyDescription("Applicable to mapping steps only")
    private Boolean validateEntity;
    @JsonProperty("outputDatabase")
    private String outputDatabase;
    @JsonProperty("inputDatabase")
    private String inputDatabase;
    @JsonProperty("outputFormat")
    private StepV1 .OutputFormat outputFormat;
    /**
     * Comma-delimited string of role,capability,role,capability,etc
     * 
     */
    @JsonProperty("outputPermissions")
    @JsonPropertyDescription("Comma-delimited string of role,capability,role,capability,etc")
    private String outputPermissions;
    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("outputCollections")
    @JsonPropertyDescription("additional collections provided by the user that get applied to the step output")
    private List<String> outputCollections = new ArrayList<String>();
    /**
     * default collections associated with a step that are applied to the step output
     * 
     */
    @JsonProperty("defaultOutputCollections")
    @JsonPropertyDescription("default collections associated with a step that are applied to the step output")
    private List<String> defaultOutputCollections = new ArrayList<String>();
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
    private StepV1 .ProvenanceGranularityLevel provenanceGranularityLevel;
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
     * The identifier of an Entity Type. (IRI, with title as fallback)
     * 
     */
    @JsonProperty("targetEntityTypeId")
    @JsonPropertyDescription("The identifier of an Entity Type. (IRI, with title as fallback)")
    private String targetEntityTypeId;
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

    @JsonProperty("customHook")
    public CustomHook getCustomHook() {
        return customHook;
    }

    @JsonProperty("customHook")
    public void setCustomHook(CustomHook customHook) {
        this.customHook = customHook;
    }

    /**
     * If set, overrides the threadCount defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("threadCount")
    public Double getThreadCount() {
        return threadCount;
    }

    /**
     * If set, overrides the threadCount defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("threadCount")
    public void setThreadCount(Double threadCount) {
        this.threadCount = threadCount;
    }

    /**
     * If set, overrides the batchSize defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("batchSize")
    public Double getBatchSize() {
        return batchSize;
    }

    /**
     * If set, overrides the batchSize defined at the flow level and in the step definition
     * 
     */
    @JsonProperty("batchSize")
    public void setBatchSize(Double batchSize) {
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
    public Headers getHeaders() {
        return headers;
    }

    /**
     * Any properties in this object will be copied into the headers of each document processed by the step
     * 
     */
    @JsonProperty("headers")
    public void setHeaders(Headers headers) {
        this.headers = headers;
    }

    /**
     * Applicable to mapping steps only
     * 
     */
    @JsonProperty("validateEntity")
    public Boolean getValidateEntity() {
        return validateEntity;
    }

    /**
     * Applicable to mapping steps only
     * 
     */
    @JsonProperty("validateEntity")
    public void setValidateEntity(Boolean validateEntity) {
        this.validateEntity = validateEntity;
    }

    @JsonProperty("outputDatabase")
    public String getOutputDatabase() {
        return outputDatabase;
    }

    @JsonProperty("outputDatabase")
    public void setOutputDatabase(String outputDatabase) {
        this.outputDatabase = outputDatabase;
    }

    @JsonProperty("inputDatabase")
    public String getInputDatabase() {
        return inputDatabase;
    }

    @JsonProperty("inputDatabase")
    public void setInputDatabase(String inputDatabase) {
        this.inputDatabase = inputDatabase;
    }

    @JsonProperty("outputFormat")
    public StepV1 .OutputFormat getOutputFormat() {
        return outputFormat;
    }

    @JsonProperty("outputFormat")
    public void setOutputFormat(StepV1 .OutputFormat outputFormat) {
        this.outputFormat = outputFormat;
    }

    /**
     * Comma-delimited string of role,capability,role,capability,etc
     * 
     */
    @JsonProperty("outputPermissions")
    public String getOutputPermissions() {
        return outputPermissions;
    }

    /**
     * Comma-delimited string of role,capability,role,capability,etc
     * 
     */
    @JsonProperty("outputPermissions")
    public void setOutputPermissions(String outputPermissions) {
        this.outputPermissions = outputPermissions;
    }

    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("outputCollections")
    public List<String> getOutputCollections() {
        return outputCollections;
    }

    /**
     * additional collections provided by the user that get applied to the step output
     * 
     */
    @JsonProperty("outputCollections")
    public void setOutputCollections(List<String> outputCollections) {
        this.outputCollections = outputCollections;
    }

    /**
     * default collections associated with a step that are applied to the step output
     * 
     */
    @JsonProperty("defaultOutputCollections")
    public List<String> getDefaultOutputCollections() {
        return defaultOutputCollections;
    }

    /**
     * default collections associated with a step that are applied to the step output
     * 
     */
    @JsonProperty("defaultOutputCollections")
    public void setDefaultOutputCollections(List<String> defaultOutputCollections) {
        this.defaultOutputCollections = defaultOutputCollections;
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
    public StepV1 .ProvenanceGranularityLevel getProvenanceGranularityLevel() {
        return provenanceGranularityLevel;
    }

    /**
     * The granularity of the provenance tracking information: coarse (default) to store document-level provenance information only, fine to store document-level and property-level provenance information, or off to disable provenance tracking in future job runs. Applies only to mapping, matching, merging, mastering, and custom steps.
     * 
     */
    @JsonProperty("provenanceGranularityLevel")
    public void setProvenanceGranularityLevel(StepV1 .ProvenanceGranularityLevel provenanceGranularityLevel) {
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
     * The identifier of an Entity Type. (IRI, with title as fallback)
     * 
     */
    @JsonProperty("targetEntityTypeId")
    public String getTargetEntityTypeId() {
        return targetEntityTypeId;
    }

    /**
     * The identifier of an Entity Type. (IRI, with title as fallback)
     * 
     */
    @JsonProperty("targetEntityTypeId")
    public void setTargetEntityTypeId(String targetEntityTypeId) {
        this.targetEntityTypeId = targetEntityTypeId;
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
        sb.append(StepV1 .class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
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
        sb.append("validateEntity");
        sb.append('=');
        sb.append(((this.validateEntity == null)?"<null>":this.validateEntity));
        sb.append(',');
        sb.append("outputDatabase");
        sb.append('=');
        sb.append(((this.outputDatabase == null)?"<null>":this.outputDatabase));
        sb.append(',');
        sb.append("inputDatabase");
        sb.append('=');
        sb.append(((this.inputDatabase == null)?"<null>":this.inputDatabase));
        sb.append(',');
        sb.append("outputFormat");
        sb.append('=');
        sb.append(((this.outputFormat == null)?"<null>":this.outputFormat));
        sb.append(',');
        sb.append("outputPermissions");
        sb.append('=');
        sb.append(((this.outputPermissions == null)?"<null>":this.outputPermissions));
        sb.append(',');
        sb.append("outputCollections");
        sb.append('=');
        sb.append(((this.outputCollections == null)?"<null>":this.outputCollections));
        sb.append(',');
        sb.append("defaultOutputCollections");
        sb.append('=');
        sb.append(((this.defaultOutputCollections == null)?"<null>":this.defaultOutputCollections));
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
        sb.append("targetEntityTypeId");
        sb.append('=');
        sb.append(((this.targetEntityTypeId == null)?"<null>":this.targetEntityTypeId));
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
        result = ((result* 31)+((this.outputCollections == null)? 0 :this.outputCollections.hashCode()));
        result = ((result* 31)+((this.acceptsBatch == null)? 0 :this.acceptsBatch.hashCode()));
        result = ((result* 31)+((this.customHook == null)? 0 :this.customHook.hashCode()));
        result = ((result* 31)+((this.validateEntity == null)? 0 :this.validateEntity.hashCode()));
        result = ((result* 31)+((this.stepId == null)? 0 :this.stepId.hashCode()));
        result = ((result* 31)+((this.targetEntityTypeId == null)? 0 :this.targetEntityTypeId.hashCode()));
        result = ((result* 31)+((this.description == null)? 0 :this.description.hashCode()));
        result = ((result* 31)+((this.processors == null)? 0 :this.processors.hashCode()));
        result = ((result* 31)+((this.inputDatabase == null)? 0 :this.inputDatabase.hashCode()));
        result = ((result* 31)+((this.stepDefinitionName == null)? 0 :this.stepDefinitionName.hashCode()));
        result = ((result* 31)+((this.outputFormat == null)? 0 :this.outputFormat.hashCode()));
        result = ((result* 31)+((this.outputPermissions == null)? 0 :this.outputPermissions.hashCode()));
        result = ((result* 31)+((this.headers == null)? 0 :this.headers.hashCode()));
        result = ((result* 31)+((this.defaultOutputCollections == null)? 0 :this.defaultOutputCollections.hashCode()));
        result = ((result* 31)+((this.threadCount == null)? 0 :this.threadCount.hashCode()));
        result = ((result* 31)+((this.stepDefinitionType == null)? 0 :this.stepDefinitionType.hashCode()));
        result = ((result* 31)+((this.constrainSourceQueryToJob == null)? 0 :this.constrainSourceQueryToJob.hashCode()));
        result = ((result* 31)+((this.outputDatabase == null)? 0 :this.outputDatabase.hashCode()));
        result = ((result* 31)+((this.sourceQueryIsScript == null)? 0 :this.sourceQueryIsScript.hashCode()));
        result = ((result* 31)+((this.name == null)? 0 :this.name.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.batchSize == null)? 0 :this.batchSize.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof StepV1) == false) {
            return false;
        }
        StepV1 rhs = ((StepV1) other);
        return ((((((((((((((((((((((((((this.stepUpdate == rhs.stepUpdate)||((this.stepUpdate!= null)&&this.stepUpdate.equals(rhs.stepUpdate)))&&((this.sourceQuery == rhs.sourceQuery)||((this.sourceQuery!= null)&&this.sourceQuery.equals(rhs.sourceQuery))))&&((this.provenanceGranularityLevel == rhs.provenanceGranularityLevel)||((this.provenanceGranularityLevel!= null)&&this.provenanceGranularityLevel.equals(rhs.provenanceGranularityLevel))))&&((this.outputCollections == rhs.outputCollections)||((this.outputCollections!= null)&&this.outputCollections.equals(rhs.outputCollections))))&&((this.acceptsBatch == rhs.acceptsBatch)||((this.acceptsBatch!= null)&&this.acceptsBatch.equals(rhs.acceptsBatch))))&&((this.customHook == rhs.customHook)||((this.customHook!= null)&&this.customHook.equals(rhs.customHook))))&&((this.validateEntity == rhs.validateEntity)||((this.validateEntity!= null)&&this.validateEntity.equals(rhs.validateEntity))))&&((this.stepId == rhs.stepId)||((this.stepId!= null)&&this.stepId.equals(rhs.stepId))))&&((this.targetEntityTypeId == rhs.targetEntityTypeId)||((this.targetEntityTypeId!= null)&&this.targetEntityTypeId.equals(rhs.targetEntityTypeId))))&&((this.description == rhs.description)||((this.description!= null)&&this.description.equals(rhs.description))))&&((this.processors == rhs.processors)||((this.processors!= null)&&this.processors.equals(rhs.processors))))&&((this.inputDatabase == rhs.inputDatabase)||((this.inputDatabase!= null)&&this.inputDatabase.equals(rhs.inputDatabase))))&&((this.stepDefinitionName == rhs.stepDefinitionName)||((this.stepDefinitionName!= null)&&this.stepDefinitionName.equals(rhs.stepDefinitionName))))&&((this.outputFormat == rhs.outputFormat)||((this.outputFormat!= null)&&this.outputFormat.equals(rhs.outputFormat))))&&((this.outputPermissions == rhs.outputPermissions)||((this.outputPermissions!= null)&&this.outputPermissions.equals(rhs.outputPermissions))))&&((this.headers == rhs.headers)||((this.headers!= null)&&this.headers.equals(rhs.headers))))&&((this.defaultOutputCollections == rhs.defaultOutputCollections)||((this.defaultOutputCollections!= null)&&this.defaultOutputCollections.equals(rhs.defaultOutputCollections))))&&((this.threadCount == rhs.threadCount)||((this.threadCount!= null)&&this.threadCount.equals(rhs.threadCount))))&&((this.stepDefinitionType == rhs.stepDefinitionType)||((this.stepDefinitionType!= null)&&this.stepDefinitionType.equals(rhs.stepDefinitionType))))&&((this.constrainSourceQueryToJob == rhs.constrainSourceQueryToJob)||((this.constrainSourceQueryToJob!= null)&&this.constrainSourceQueryToJob.equals(rhs.constrainSourceQueryToJob))))&&((this.outputDatabase == rhs.outputDatabase)||((this.outputDatabase!= null)&&this.outputDatabase.equals(rhs.outputDatabase))))&&((this.sourceQueryIsScript == rhs.sourceQueryIsScript)||((this.sourceQueryIsScript!= null)&&this.sourceQueryIsScript.equals(rhs.sourceQueryIsScript))))&&((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.batchSize == rhs.batchSize)||((this.batchSize!= null)&&this.batchSize.equals(rhs.batchSize))));
    }

    public enum OutputFormat {

        JSON("json"),
        XML("xml");
        private final String value;
        private final static Map<String, StepV1 .OutputFormat> CONSTANTS = new HashMap<String, StepV1 .OutputFormat>();

        static {
            for (StepV1 .OutputFormat c: values()) {
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
        public static StepV1 .OutputFormat fromValue(String value) {
            StepV1 .OutputFormat constant = CONSTANTS.get(value);
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
        private final static Map<String, StepV1 .ProvenanceGranularityLevel> CONSTANTS = new HashMap<String, StepV1 .ProvenanceGranularityLevel>();

        static {
            for (StepV1 .ProvenanceGranularityLevel c: values()) {
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
        public static StepV1 .ProvenanceGranularityLevel fromValue(String value) {
            StepV1 .ProvenanceGranularityLevel constant = CONSTANTS.get(value);
            if (constant == null) {
                throw new IllegalArgumentException(value);
            } else {
                return constant;
            }
        }

    }

}
