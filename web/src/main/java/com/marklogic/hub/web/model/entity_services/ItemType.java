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

public class ItemType extends JsonPojo {
    @JsonProperty(value = "$ref")
    protected String ref;
    protected String datatype;
    protected String collation;

    public String getRef() {
        return ref;
    }

    public void setRef(String ref) {
        this.ref = ref;
    }

    public String getDatatype() {
        return datatype;
    }

    public void setDatatype(String datatype) {
        this.datatype = datatype;
    }

    public String getCollation() {
        return collation;
    }

    public void setCollation(String collation) {
        this.collation = collation;
    }

    public boolean hasValues() {
        return (
            (ref != null && !ref.isEmpty()) ||
            (datatype != null && !datatype.isEmpty()) ||
            (collation != null && !collation.isEmpty())
        );
    }

    public static ItemType fromJson(JsonNode node) {
        ItemType itemType = new ItemType();
        itemType.setRef(getValue(node, "$ref"));
        itemType.setDatatype(getValue(node, "datatype"));
        itemType.setCollation(getValue(node, "collation"));
        return itemType;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        writeStringIf(node, "$ref", ref);
        writeStringIf(node, "datatype", datatype);
        writeStringIf(node, "collation", collation);
        return node;
    }
}
