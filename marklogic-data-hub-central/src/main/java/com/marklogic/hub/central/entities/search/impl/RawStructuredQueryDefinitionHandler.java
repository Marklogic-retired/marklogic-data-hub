package com.marklogic.hub.central.entities.search.impl;

import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.client.query.StructuredQueryDefinition;

// This is a helper class to allow custom constraints with various formats to be added to a Structured Query.
public class RawStructuredQueryDefinitionHandler implements StructuredQueryDefinition {
    private RawStructuredQueryDefinition rawStructuredQueryDefinition;

    public RawStructuredQueryDefinitionHandler(RawStructuredQueryDefinition rawStructuredQueryDefinition) {
        this.rawStructuredQueryDefinition = rawStructuredQueryDefinition;
    }

    /**
     * Returns the structured query definition as a serialized XML string.
     *
     * @return The serialized definition.
     */
    @Override
    public String serialize() {
        return this.rawStructuredQueryDefinition.serialize();
    }

    /**
     * Returns the query criteria, that is the query string.
     *
     * @return The query string.
     */
    @Override
    public String getCriteria() {
        return this.rawStructuredQueryDefinition.getCriteria();
    }

    /**
     * Sets the query criteria as a query string.
     *
     * @param criteria The query string.
     */
    @Override
    public void setCriteria(String criteria) {
        this.rawStructuredQueryDefinition.setCriteria(criteria);
    }

    /**
     * Sets the query criteria as a query string and returns the query
     * definition as a fluent convenience.
     *
     * @param criteria The query string.
     * @return This query definition.
     */
    @Override
    public StructuredQueryDefinition withCriteria(String criteria) {
        setCriteria(criteria);
        return this;
    }

    /**
     * Returns the array of collections to which the query is limited.
     *
     * @return The array of collection URIs.
     */
    @Override
    public String[] getCollections() {
        return this.rawStructuredQueryDefinition.getCollections();
    }

    /**
     * Sets the list of collections to which the query should be limited.
     *
     * @param collections The list of collection URIs.
     */
    @Override
    public void setCollections(String... collections) {
        this.rawStructuredQueryDefinition.setCollections(collections);
    }

    /**
     * Returns the directory to which the query is limited.
     *
     * @return The directory URI.
     */
    @Override
    public String getDirectory() {
        return this.rawStructuredQueryDefinition.getDirectory();
    }

    /**
     * Sets the directory to which the query should be limited.
     *
     * @param directory The directory URI.
     */
    @Override
    public void setDirectory(String directory) {
        this.rawStructuredQueryDefinition.setDirectory(directory);
    }

    /**
     * Returns the name of the query options used for this query.
     *
     * @return The options name.
     */
    @Override
    public String getOptionsName() {
        return this.rawStructuredQueryDefinition.getOptionsName();
    }

    /**
     * Sets the name of the query options to be used for this query.
     * <p>
     * If no query options node with the specified name exists, the search will fail.
     *
     * @param name The name of the saved query options node on the server.
     */
    @Override
    public void setOptionsName(String name) {
        this.rawStructuredQueryDefinition.setOptionsName(name);
    }

    /**
     * Returns the transform that modifies responses to this query
     * on the server.
     *
     * @return The transform.
     */
    @Override
    public ServerTransform getResponseTransform() {
        return this.rawStructuredQueryDefinition.getResponseTransform();
    }

    /**
     * Specifies a transform that modifies responses to this query
     * on the server.
     *
     * @param transform A server transform to modify the query response.
     */
    @Override
    public void setResponseTransform(ServerTransform transform) {
        this.rawStructuredQueryDefinition.setResponseTransform(transform);
    }
}
