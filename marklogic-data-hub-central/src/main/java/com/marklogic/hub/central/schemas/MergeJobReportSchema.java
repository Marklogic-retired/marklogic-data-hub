
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
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
 * MergeJobReport
 * <p>
 * Captures a summary of the results of a merging or mastering step
 * 
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "jobID",
    "jobReportID",
    "flowName",
    "stepName",
    "numberOfDocumentsProcessed",
    "numberOfDocumentsSuccessfullyProcessed",
    "resultingMerges",
    "documentsArchived",
    "masterDocuments",
    "notificationDocuments",
    "collectionsInformation",
    "matchProvenanceQuery"
})
@Generated("jsonschema2pojo")
public class MergeJobReportSchema {

    @JsonProperty("jobID")
    private String jobID;
    @JsonProperty("jobReportID")
    private String jobReportID;
    @JsonProperty("flowName")
    private String flowName;
    @JsonProperty("stepName")
    private String stepName;
    @JsonProperty("numberOfDocumentsProcessed")
    private Integer numberOfDocumentsProcessed;
    @JsonProperty("numberOfDocumentsSuccessfullyProcessed")
    private Integer numberOfDocumentsSuccessfullyProcessed;
    @JsonProperty("resultingMerges")
    private ResultingMerges resultingMerges;
    @JsonProperty("documentsArchived")
    private DocumentsArchived documentsArchived;
    @JsonProperty("masterDocuments")
    private MasterDocuments masterDocuments;
    @JsonProperty("notificationDocuments")
    private NotificationDocuments notificationDocuments;
    /**
     * Defines collection names associated with the possible outputs of this step
     * 
     */
    @JsonProperty("collectionsInformation")
    @JsonPropertyDescription("Defines collection names associated with the possible outputs of this step")
    private CollectionsInformation collectionsInformation;
    /**
     * A query that can be run to find provenance data associated with the documents merged by this step
     * 
     */
    @JsonProperty("matchProvenanceQuery")
    @JsonPropertyDescription("A query that can be run to find provenance data associated with the documents merged by this step")
    private String matchProvenanceQuery;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    @JsonProperty("jobID")
    public String getJobID() {
        return jobID;
    }

    @JsonProperty("jobID")
    public void setJobID(String jobID) {
        this.jobID = jobID;
    }

    @JsonProperty("jobReportID")
    public String getJobReportID() {
        return jobReportID;
    }

    @JsonProperty("jobReportID")
    public void setJobReportID(String jobReportID) {
        this.jobReportID = jobReportID;
    }

    @JsonProperty("flowName")
    public String getFlowName() {
        return flowName;
    }

    @JsonProperty("flowName")
    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    @JsonProperty("stepName")
    public String getStepName() {
        return stepName;
    }

    @JsonProperty("stepName")
    public void setStepName(String stepName) {
        this.stepName = stepName;
    }

    @JsonProperty("numberOfDocumentsProcessed")
    public Integer getNumberOfDocumentsProcessed() {
        return numberOfDocumentsProcessed;
    }

    @JsonProperty("numberOfDocumentsProcessed")
    public void setNumberOfDocumentsProcessed(Integer numberOfDocumentsProcessed) {
        this.numberOfDocumentsProcessed = numberOfDocumentsProcessed;
    }

    @JsonProperty("numberOfDocumentsSuccessfullyProcessed")
    public Integer getNumberOfDocumentsSuccessfullyProcessed() {
        return numberOfDocumentsSuccessfullyProcessed;
    }

    @JsonProperty("numberOfDocumentsSuccessfullyProcessed")
    public void setNumberOfDocumentsSuccessfullyProcessed(Integer numberOfDocumentsSuccessfullyProcessed) {
        this.numberOfDocumentsSuccessfullyProcessed = numberOfDocumentsSuccessfullyProcessed;
    }

    @JsonProperty("resultingMerges")
    public ResultingMerges getResultingMerges() {
        return resultingMerges;
    }

    @JsonProperty("resultingMerges")
    public void setResultingMerges(ResultingMerges resultingMerges) {
        this.resultingMerges = resultingMerges;
    }

    @JsonProperty("documentsArchived")
    public DocumentsArchived getDocumentsArchived() {
        return documentsArchived;
    }

    @JsonProperty("documentsArchived")
    public void setDocumentsArchived(DocumentsArchived documentsArchived) {
        this.documentsArchived = documentsArchived;
    }

    @JsonProperty("masterDocuments")
    public MasterDocuments getMasterDocuments() {
        return masterDocuments;
    }

    @JsonProperty("masterDocuments")
    public void setMasterDocuments(MasterDocuments masterDocuments) {
        this.masterDocuments = masterDocuments;
    }

    @JsonProperty("notificationDocuments")
    public NotificationDocuments getNotificationDocuments() {
        return notificationDocuments;
    }

    @JsonProperty("notificationDocuments")
    public void setNotificationDocuments(NotificationDocuments notificationDocuments) {
        this.notificationDocuments = notificationDocuments;
    }

    /**
     * Defines collection names associated with the possible outputs of this step
     * 
     */
    @JsonProperty("collectionsInformation")
    public CollectionsInformation getCollectionsInformation() {
        return collectionsInformation;
    }

    /**
     * Defines collection names associated with the possible outputs of this step
     * 
     */
    @JsonProperty("collectionsInformation")
    public void setCollectionsInformation(CollectionsInformation collectionsInformation) {
        this.collectionsInformation = collectionsInformation;
    }

    /**
     * A query that can be run to find provenance data associated with the documents merged by this step
     * 
     */
    @JsonProperty("matchProvenanceQuery")
    public String getMatchProvenanceQuery() {
        return matchProvenanceQuery;
    }

    /**
     * A query that can be run to find provenance data associated with the documents merged by this step
     * 
     */
    @JsonProperty("matchProvenanceQuery")
    public void setMatchProvenanceQuery(String matchProvenanceQuery) {
        this.matchProvenanceQuery = matchProvenanceQuery;
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
        sb.append(MergeJobReportSchema.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("jobID");
        sb.append('=');
        sb.append(((this.jobID == null)?"<null>":this.jobID));
        sb.append(',');
        sb.append("jobReportID");
        sb.append('=');
        sb.append(((this.jobReportID == null)?"<null>":this.jobReportID));
        sb.append(',');
        sb.append("flowName");
        sb.append('=');
        sb.append(((this.flowName == null)?"<null>":this.flowName));
        sb.append(',');
        sb.append("stepName");
        sb.append('=');
        sb.append(((this.stepName == null)?"<null>":this.stepName));
        sb.append(',');
        sb.append("numberOfDocumentsProcessed");
        sb.append('=');
        sb.append(((this.numberOfDocumentsProcessed == null)?"<null>":this.numberOfDocumentsProcessed));
        sb.append(',');
        sb.append("numberOfDocumentsSuccessfullyProcessed");
        sb.append('=');
        sb.append(((this.numberOfDocumentsSuccessfullyProcessed == null)?"<null>":this.numberOfDocumentsSuccessfullyProcessed));
        sb.append(',');
        sb.append("resultingMerges");
        sb.append('=');
        sb.append(((this.resultingMerges == null)?"<null>":this.resultingMerges));
        sb.append(',');
        sb.append("documentsArchived");
        sb.append('=');
        sb.append(((this.documentsArchived == null)?"<null>":this.documentsArchived));
        sb.append(',');
        sb.append("masterDocuments");
        sb.append('=');
        sb.append(((this.masterDocuments == null)?"<null>":this.masterDocuments));
        sb.append(',');
        sb.append("notificationDocuments");
        sb.append('=');
        sb.append(((this.notificationDocuments == null)?"<null>":this.notificationDocuments));
        sb.append(',');
        sb.append("collectionsInformation");
        sb.append('=');
        sb.append(((this.collectionsInformation == null)?"<null>":this.collectionsInformation));
        sb.append(',');
        sb.append("matchProvenanceQuery");
        sb.append('=');
        sb.append(((this.matchProvenanceQuery == null)?"<null>":this.matchProvenanceQuery));
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
        result = ((result* 31)+((this.resultingMerges == null)? 0 :this.resultingMerges.hashCode()));
        result = ((result* 31)+((this.flowName == null)? 0 :this.flowName.hashCode()));
        result = ((result* 31)+((this.jobReportID == null)? 0 :this.jobReportID.hashCode()));
        result = ((result* 31)+((this.matchProvenanceQuery == null)? 0 :this.matchProvenanceQuery.hashCode()));
        result = ((result* 31)+((this.jobID == null)? 0 :this.jobID.hashCode()));
        result = ((result* 31)+((this.documentsArchived == null)? 0 :this.documentsArchived.hashCode()));
        result = ((result* 31)+((this.stepName == null)? 0 :this.stepName.hashCode()));
        result = ((result* 31)+((this.notificationDocuments == null)? 0 :this.notificationDocuments.hashCode()));
        result = ((result* 31)+((this.masterDocuments == null)? 0 :this.masterDocuments.hashCode()));
        result = ((result* 31)+((this.numberOfDocumentsProcessed == null)? 0 :this.numberOfDocumentsProcessed.hashCode()));
        result = ((result* 31)+((this.numberOfDocumentsSuccessfullyProcessed == null)? 0 :this.numberOfDocumentsSuccessfullyProcessed.hashCode()));
        result = ((result* 31)+((this.collectionsInformation == null)? 0 :this.collectionsInformation.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof MergeJobReportSchema) == false) {
            return false;
        }
        MergeJobReportSchema rhs = ((MergeJobReportSchema) other);
        return ((((((((((((((this.resultingMerges == rhs.resultingMerges)||((this.resultingMerges!= null)&&this.resultingMerges.equals(rhs.resultingMerges)))&&((this.flowName == rhs.flowName)||((this.flowName!= null)&&this.flowName.equals(rhs.flowName))))&&((this.jobReportID == rhs.jobReportID)||((this.jobReportID!= null)&&this.jobReportID.equals(rhs.jobReportID))))&&((this.matchProvenanceQuery == rhs.matchProvenanceQuery)||((this.matchProvenanceQuery!= null)&&this.matchProvenanceQuery.equals(rhs.matchProvenanceQuery))))&&((this.jobID == rhs.jobID)||((this.jobID!= null)&&this.jobID.equals(rhs.jobID))))&&((this.documentsArchived == rhs.documentsArchived)||((this.documentsArchived!= null)&&this.documentsArchived.equals(rhs.documentsArchived))))&&((this.stepName == rhs.stepName)||((this.stepName!= null)&&this.stepName.equals(rhs.stepName))))&&((this.notificationDocuments == rhs.notificationDocuments)||((this.notificationDocuments!= null)&&this.notificationDocuments.equals(rhs.notificationDocuments))))&&((this.masterDocuments == rhs.masterDocuments)||((this.masterDocuments!= null)&&this.masterDocuments.equals(rhs.masterDocuments))))&&((this.numberOfDocumentsProcessed == rhs.numberOfDocumentsProcessed)||((this.numberOfDocumentsProcessed!= null)&&this.numberOfDocumentsProcessed.equals(rhs.numberOfDocumentsProcessed))))&&((this.numberOfDocumentsSuccessfullyProcessed == rhs.numberOfDocumentsSuccessfullyProcessed)||((this.numberOfDocumentsSuccessfullyProcessed!= null)&&this.numberOfDocumentsSuccessfullyProcessed.equals(rhs.numberOfDocumentsSuccessfullyProcessed))))&&((this.collectionsInformation == rhs.collectionsInformation)||((this.collectionsInformation!= null)&&this.collectionsInformation.equals(rhs.collectionsInformation))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))));
    }

}
