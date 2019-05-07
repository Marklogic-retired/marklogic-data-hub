/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class DefinitionType extends JsonPojo {
    protected String name;
    protected String description;
    protected String primaryKey;
    protected String namespace;
    protected String namespacePrefix;
    protected List<String> required;
    protected List<String> pii;
    protected List<String> elementRangeIndex;
    protected List<String> rangeIndex;
    protected List<String> wordLexicon;

    protected List<PropertyType> properties;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPrimaryKey() {
        return primaryKey;
    }

    public void setPrimaryKey(String primaryKey) {
        this.primaryKey = primaryKey;
    }

    public List<String> getRequired() {
        return required;
    }

    public void setRequired(List<String> required) {
        this.required = required;
    }

    public List<String> getPii() {
        return pii;
    }

    public void setPii(List<String> pii) {
        this.pii = pii;
    }

    public List<String> getRangeIndex() {
        return rangeIndex;
    }

    public void setRangeIndex(List<String> rangeIndex) {
        this.rangeIndex = rangeIndex;
    }

    public List<String> getElementRangeIndex() {
        return elementRangeIndex;
    }

    public void setElementRangeIndex(List<String> elementRangeIndex) {
        this.elementRangeIndex = elementRangeIndex;
    }

    public List<String> getWordLexicon() {
        return wordLexicon;
    }

    public void setWordLexicon(List<String> wordLexicon) {
        this.wordLexicon = wordLexicon;
    }

    public List<PropertyType> getProperties() {
        return properties;
    }

    public void setProperties(List<PropertyType> properties) {
        this.properties = properties;
    }

    public String getNamespace() {
        return namespace;
    }

    public void setNamespace(String namespace) {
        this.namespace = namespace;
    }

    public String getNamespacePrefix() {
        return namespacePrefix;
    }

    public void setNamespacePrefix(String namespacePrefix) {
        this.namespacePrefix = namespacePrefix;
    }

    public static DefinitionType fromJson(String name, JsonNode node) {
        DefinitionType definitionType = new DefinitionType();
        definitionType.setName(name);

        definitionType.setDescription(getValue(node, "description"));
        definitionType.setPrimaryKey(getValue(node, "primaryKey"));
        definitionType.setNamespace(getValue(node, "namespace"));
        definitionType.setNamespacePrefix(getValue(node, "namespacePrefix"));

        ArrayList<String> required = new ArrayList<>();
        JsonNode requiredNodes = node.get("required");
        if (requiredNodes != null) {
            for (final JsonNode n : requiredNodes) {
                required.add(n.asText());
            }
        }
        definitionType.setRequired(required);

        ArrayList<String> pii = new ArrayList<>();
        JsonNode piiNodes = node.get("pii");
        if (piiNodes != null) {
            for (final JsonNode n : piiNodes) {
                pii.add(n.asText());
            }
        }
        definitionType.setPii(pii);

        ArrayList<String> elementRangeIndexes = new ArrayList<>();
        JsonNode elementRangeIndexNodes = node.get("elementRangeIndex");
        if (elementRangeIndexNodes != null) {
            for (final JsonNode n : elementRangeIndexNodes) {
                elementRangeIndexes.add(n.asText());
            }
        }
        definitionType.setElementRangeIndex(elementRangeIndexes);

        ArrayList<String> rangeIndexes = new ArrayList<>();
        JsonNode rangeIndexNodes = node.get("rangeIndex");
        if (rangeIndexNodes != null) {
            for (final JsonNode n : rangeIndexNodes) {
                rangeIndexes.add(n.asText());
            }
        }
        definitionType.setRangeIndex(rangeIndexes);

        ArrayList<String> wordLexicons = new ArrayList<>();
        JsonNode wordLexiconNodes = node.get("wordLexicon");
        if (wordLexiconNodes != null) {
            for (final JsonNode n : wordLexiconNodes) {
                wordLexicons.add(n.asText());
            }
        }
        definitionType.setWordLexicon(wordLexicons);

        ArrayList<PropertyType> properties = new ArrayList<>();
        JsonNode propertiesNode = node.get("properties");
        if (propertiesNode != null) {
            Iterator<String> fieldItr = propertiesNode.fieldNames();
            while(fieldItr.hasNext()) {
                String key = fieldItr.next();
                JsonNode propertyNode = propertiesNode.get(key);
                if (propertyNode != null) {
                    properties.add(PropertyType.fromJson(key, propertyNode));
                }
            }
        }
        definitionType.setProperties(properties);

        return definitionType;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        writeStringIf(node, "description", description);
        writeStringIf(node, "primaryKey", primaryKey);
        writeStringIf(node, "namespace", namespace);
        writeStringIf(node, "namespacePrefix", namespacePrefix);

        ArrayNode requiredArray = JsonNodeFactory.instance.arrayNode();
        required.forEach(requiredArray::add);
        node.set("required", requiredArray);

        ArrayNode piiArray = JsonNodeFactory.instance.arrayNode();
        pii.forEach(piiArray::add);
        node.set("pii", piiArray);

        ArrayNode elementRangeIndexArray = JsonNodeFactory.instance.arrayNode();
        elementRangeIndex.forEach(elementRangeIndexArray ::add);
        node.set("elementRangeIndex", elementRangeIndexArray);

        ArrayNode rangeIndexArray = JsonNodeFactory.instance.arrayNode();
        rangeIndex.forEach(rangeIndexArray ::add);
        node.set("rangeIndex", rangeIndexArray);

        ArrayNode wordLexiconArray = JsonNodeFactory.instance.arrayNode();
        wordLexicon.forEach(wordLexiconArray::add);
        node.set("wordLexicon", wordLexiconArray);

        ObjectNode propertiesObj = JsonNodeFactory.instance.objectNode();

        for (PropertyType prop : properties) {
            propertiesObj.set(prop.getName(), prop.toJson());
        }
        node.set("properties", propertiesObj);
        return node;
    }
}
