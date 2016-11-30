package com.marklogic.quickstart.model.entity_services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class InfoType extends JsonPojo {

    protected String title;
    protected String version;
    protected String baseUri;
    protected String description;

    /**
     * Gets the value of the title property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getTitle() {
        return title;
    }

    /**
     * Sets the value of the title property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setTitle(String value) {
        this.title = value;
    }

    /**
     * Gets the value of the version property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getVersion() {
        return version;
    }

    /**
     * Sets the value of the version property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setVersion(String value) {
        this.version = value;
    }

    /**
     * Gets the value of the baseUri property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getBaseUri() {
        return baseUri;
    }

    /**
     * Sets the value of the baseUri property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setBaseUri(String value) {
        this.baseUri = value;
    }

    /**
     * Gets the value of the description property.
     *
     * @return
     *     possible object is
     *     {@link String }
     *
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the value of the description property.
     *
     * @param value
     *     allowed object is
     *     {@link String }
     *
     */
    public void setDescription(String value) {
        this.description = value;
    }

    public static InfoType fromJson(JsonNode node) {
        InfoType infoType = new InfoType();
        infoType.title = getValue(node, "title");
        infoType.version = getValue(node, "version");
        infoType.baseUri = getValue(node, "baseUri");
        infoType.description = getValue(node, "description");
        return infoType;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        writeStringIf(node, "title", title);
        writeStringIf(node, "version", version);
        writeStringIf(node, "baseUri", baseUri);
        writeStringIf(node, "description", description);
        return node;
    }

}
