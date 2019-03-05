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
package com.marklogic.hub.web.model.entity_services;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class PropertyType extends JsonPojo {

    protected String name;
    protected String datatype;
    protected String description;

    @JsonProperty(value="$ref")
    protected String ref;

    protected String collation;

    ItemType items;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDatatype() {
        return datatype;
    }

    public void setDatatype(String datatype) {
        this.datatype = datatype;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRef() {
        return ref;
    }

    public void setRef(String ref) {
        this.ref = ref;
    }

    public String getCollation() {
        return collation;
    }

    public void setCollation(String collation) {
        this.collation = collation;
    }

    public ItemType getItems() {
        return items;
    }

    public void setItems(ItemType items) {
        this.items = items;
    }

    public static PropertyType fromJson(String name, JsonNode defs) {
        PropertyType propertyType = new PropertyType();
        propertyType.name = name;
        propertyType.datatype = getValue(defs, "datatype");
        propertyType.description = getValue(defs, "description");
        propertyType.ref = getValue(defs, "$ref");
        propertyType.collation = getValue(defs, "collation");

        JsonNode itemsNode = defs.get("items");
        if (itemsNode != null) {
            propertyType.setItems(ItemType.fromJson(itemsNode));
        }
        return propertyType;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();

        writeStringIf(node, "datatype", datatype);
        writeStringIf(node, "description", description);
        writeStringIf(node, "$ref", ref);
        writeStringIf(node, "collation", collation);

        if (items != null && items.hasValues()) {
            node.set("items", items.toJson());
        }

        return node;
    }
}
