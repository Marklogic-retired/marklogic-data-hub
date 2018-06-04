package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.HashMap;

public interface Mapping {

    /**
     * Returns the mapping version
     * @return mapping version
     */
    String getVersion();

    /**
     * Sets the version for the mapping
     * @param version
     */
    void setVersion(String version);

    /**
     * Gets the hashmap of the properties mapping
     * @return a hashmap of all the properties that have been mapped
     */
    HashMap<String, ObjectNode> getProperties();

    /**
     * Sets the properties hashmap for the mapping
     * @param properties
     */
    void setProperties(HashMap<String, ObjectNode> properties);

    /**
     * Returns the name of the mapping as a string
     * @return name of the mapping as a string
     */
    String getName();

    /**
     * Sets the name of the mapping as a string
     * @param name
     */
    void setName(String name);

    /**
     *  Returns the source context string for the mapping
     * @return string representation of source context
     */
    String getSourceContext();

    /**
     * Sets the source context for the mapping
     * @param sourceContext
     */
    void setSourceContext(String sourceContext);

    /**
     * Returns the IRI for the targeted entity type
     * @return
     */
    String getTargetEntityType();

    /**
     * Setting the IRI for the target entity type
     * @param targetEntityType
     */
    void setTargetEntityType(String targetEntityType);

    /**
     * Returns a string description of what the mapping is/does
     * @return a string description
     */
    String getDescription();

    /**
     * Set the description for the mapping
     * @param description
     */
    void setDescription(String description);

    /**
     * Return the language key setting
     * @return the string key
     */
    String getLanguage();

    /**
     * Sets the language for the mapping to use for MarkLogic server
     * @param language
     */
    void setLanguage(String language);
}
