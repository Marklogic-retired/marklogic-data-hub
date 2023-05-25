package com.marklogic.hub.deploy.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.rest.util.JsonNodeUtil;

/**
 * This isn't "JsonUtil" because its current scope is specific to JSON resource payloads and the Manage API.
 */
public abstract class ResourceUtil {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Given a set of properties to save, this will update each array property in that set with the items from the
     * same array in the given existingResourceProperties object, if the array property exists in that object.
     * <p>
     * The intent behind calling this method is typically to not lose any items in an array property of the existing
     * resource. That's because the Manage API will always overwrite array properties with the array that is sent to it.
     * Thus, if you know that the array you're sending doesn't have all the existing items and you don't want to lose
     * any of those items, call this method.
     *
     * @param propertiesToSave           a set of resource properties that will be persisted via the Manage API
     * @param existingResourceProperties the existing properties of the resource that will be updated
     * @return the set of resource properties to save, where each array property has the contents of the existing array
     * property (if it exists) merged into it
     */
    public static ObjectNode mergeExistingArrayProperties(ObjectNode propertiesToSave, ObjectNode existingResourceProperties) {
        ObjectNode subsetOfExistingProperties = objectMapper.createObjectNode();
        propertiesToSave.fieldNames().forEachRemaining(fieldName -> {
            if (existingResourceProperties.has(fieldName)) {
                subsetOfExistingProperties.set(fieldName, existingResourceProperties.get(fieldName));
            }
        });

        try {
            // Make a copy to avoid modifying the incoming existingResourceProperties object
            ObjectNode copyOfSubsetOfProperties = (ObjectNode) objectMapper.readTree(subsetOfExistingProperties.toString());

            // mergeObjectNodes will use the second argument as the winner for non-array properties, so we pass the
            // propertiesToSave in second so it "wins"
            return JsonNodeUtil.mergeObjectNodes(copyOfSubsetOfProperties, propertiesToSave);
        } catch (Exception ex) {
            throw new RuntimeException("Unexpected JSON error when merging array properties: " + ex.getMessage(), ex);
        }
    }
}
