
package com.marklogic.hub.central.schemas;

import java.util.HashMap;
import java.util.Map;
import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
    "dateTime",
    "import-id",
    "name",
    "datahubSourceType"
})
public class Source {

    /**
     * Specific to mastering
     * 
     */
    @JsonProperty("dateTime")
    @JsonPropertyDescription("Specific to mastering")
    private String dateTime;
    /**
     * Specific to mastering
     * 
     */
    @JsonProperty("import-id")
    @JsonPropertyDescription("Specific to mastering")
    private String importId;
    /**
     * Name of a source that provides instance data in this envelope
     * 
     */
    @JsonProperty("name")
    @JsonPropertyDescription("Name of a source that provides instance data in this envelope")
    private String name;
    /**
     * Type of the source that provides instance data in this envelope
     * 
     */
    @JsonProperty("datahubSourceType")
    @JsonPropertyDescription("Type of the source that provides instance data in this envelope")
    private String datahubSourceType;
    @JsonIgnore
    private Map<String, Object> additionalProperties = new HashMap<String, Object>();

    /**
     * Specific to mastering
     * 
     */
    @JsonProperty("dateTime")
    public String getDateTime() {
        return dateTime;
    }

    /**
     * Specific to mastering
     * 
     */
    @JsonProperty("dateTime")
    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

    /**
     * Specific to mastering
     * 
     */
    @JsonProperty("import-id")
    public String getImportId() {
        return importId;
    }

    /**
     * Specific to mastering
     * 
     */
    @JsonProperty("import-id")
    public void setImportId(String importId) {
        this.importId = importId;
    }

    /**
     * Name of a source that provides instance data in this envelope
     * 
     */
    @JsonProperty("name")
    public String getName() {
        return name;
    }

    /**
     * Name of a source that provides instance data in this envelope
     * 
     */
    @JsonProperty("name")
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Type of the source that provides instance data in this envelope
     * 
     */
    @JsonProperty("datahubSourceType")
    public String getDatahubSourceType() {
        return datahubSourceType;
    }

    /**
     * Type of the source that provides instance data in this envelope
     * 
     */
    @JsonProperty("datahubSourceType")
    public void setDatahubSourceType(String datahubSourceType) {
        this.datahubSourceType = datahubSourceType;
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
        sb.append(Source.class.getName()).append('@').append(Integer.toHexString(System.identityHashCode(this))).append('[');
        sb.append("dateTime");
        sb.append('=');
        sb.append(((this.dateTime == null)?"<null>":this.dateTime));
        sb.append(',');
        sb.append("importId");
        sb.append('=');
        sb.append(((this.importId == null)?"<null>":this.importId));
        sb.append(',');
        sb.append("name");
        sb.append('=');
        sb.append(((this.name == null)?"<null>":this.name));
        sb.append(',');
        sb.append("datahubSourceType");
        sb.append('=');
        sb.append(((this.datahubSourceType == null)?"<null>":this.datahubSourceType));
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
        result = ((result* 31)+((this.dateTime == null)? 0 :this.dateTime.hashCode()));
        result = ((result* 31)+((this.name == null)? 0 :this.name.hashCode()));
        result = ((result* 31)+((this.importId == null)? 0 :this.importId.hashCode()));
        result = ((result* 31)+((this.additionalProperties == null)? 0 :this.additionalProperties.hashCode()));
        result = ((result* 31)+((this.datahubSourceType == null)? 0 :this.datahubSourceType.hashCode()));
        return result;
    }

    @Override
    public boolean equals(Object other) {
        if (other == this) {
            return true;
        }
        if ((other instanceof Source) == false) {
            return false;
        }
        Source rhs = ((Source) other);
        return ((((((this.dateTime == rhs.dateTime)||((this.dateTime!= null)&&this.dateTime.equals(rhs.dateTime)))&&((this.name == rhs.name)||((this.name!= null)&&this.name.equals(rhs.name))))&&((this.importId == rhs.importId)||((this.importId!= null)&&this.importId.equals(rhs.importId))))&&((this.additionalProperties == rhs.additionalProperties)||((this.additionalProperties!= null)&&this.additionalProperties.equals(rhs.additionalProperties))))&&((this.datahubSourceType == rhs.datahubSourceType)||((this.datahubSourceType!= null)&&this.datahubSourceType.equals(rhs.datahubSourceType))));
    }

}
