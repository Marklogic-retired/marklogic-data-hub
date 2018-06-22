package com.marklogic.hub.mapping;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.util.HashMap;

import static com.marklogic.hub.mapping.MappingImpl.*;

public interface Mapping {

    /**
     * Creates an in-memory default instance of a mapping given a name
     * @param mappingName - the name of the mapping
     * @return a Mapping object to manipulate further
     */
    static Mapping create(String mappingName) {
        return new MappingImpl(mappingName);
    }

    /**
     * Returns the mapping version
     * @return mapping version
     */
    int getVersion();

    /**
     * Sets the version for the mapping
     * @param version - a whole integer representing the version of the mapping
     */
    void setVersion(int version);

    /**
     * Gets the hashmap of the properties mapping
     * @return a hashmap of all the properties that have been mapped
     */
    HashMap<String, ObjectNode> getProperties();

    /**
     * Sets the properties hashmap for the mapping
     * @param properties - hashmap of properties and their settings for the mapping
     */
    void setProperties(HashMap<String, ObjectNode> properties);

    /**
     * Returns the name of the mapping as a string
     * @return name of the mapping as a string
     */
    String getName();

    /**
     * Sets the name of the mapping as a string
     * @param name - the name of the mapping (warning: be careful of name changes)
     */
    void setName(String name);

    /**
     *  Returns the source context string for the mapping
     * @return string representation of source context
     */
    String getSourceContext();

    /**
     * Sets the source context for the mapping
     * @param sourceContext - the xpath to start the mapping from inside the root of the documents
     */
    void setSourceContext(String sourceContext);

    /**
     * Returns the IRI for the targeted entity type
     * @return - IRI as string for what entity this mapping is targeted towards
     */
    String getTargetEntityType();

    /**
     * Setting the IRI for the target entity type
     * @param targetEntityType - the IRI of the entity you want this mapping to use
     */
    void setTargetEntityType(String targetEntityType);

    /**
     * Returns a string description of what the mapping is/does
     * @return a string description
     */
    String getDescription();

    /**
     * Set the description for the mapping
     * @param description - a short description of what this mapping's purpose is
     */
    void setDescription(String description);

    /**
     * Return the language key setting
     * @return the string key
     */
    String getLanguage();

    /**
     * *CAREFUL - DO NOT TOUCH IF YOU DON'T EXPLICITLY KNOW WHAT THIS VALUE REPRESENTS*
     * Sets the language for the mapping to use for MarkLogic server
     * @param language - sets the language key for the server - don't modify please!
     */
    void setLanguage(String language);

    /**
     * Serializes the mapping as a json string
     * @return the serialized JSON string
     */
    String serialize();

    /**
     * Deserializes a json response and applies it to this mapping
     * @param json - the jsonnode you want deserialized
     * @return this mapping
     */
    Mapping deserialize(JsonNode json);

    /**
     * Automatically increments the version of the mapping by 1
     */
    void incrementVersion();
}
