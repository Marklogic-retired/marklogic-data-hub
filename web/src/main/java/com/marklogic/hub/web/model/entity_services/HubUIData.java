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


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.awt.geom.Point2D;
import java.util.*;

public class HubUIData extends JsonPojo {
    protected int x;
    protected int y;
    protected int width;
    protected int height;
    protected Map<String, List<Point2D.Float>> vertices = new HashMap<>();

    public int getX() {
        return x;
    }

    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }

    public void setY(int y) {
        this.y = y;
    }

    public int getWidth() {
        return width;
    }

    public void setWidth(int width) {
        this.width = width;
    }

    public int getHeight() {
        return height;
    }

    public void setHeight(int height) {
        this.height = height;
    }

    public Map<String, List<Point2D.Float>> getVertices() {
        return vertices;
    }

    public void setVertices(Map<String, List<Point2D.Float>> vertices) {
        this.vertices = vertices;
    }

    public static HubUIData fromJson(JsonNode node) {
        HubUIData hubUIData = new HubUIData();
        if (node != null) {
            hubUIData.x = getIntValue(node, "x");
            hubUIData.y = getIntValue(node, "y");
            hubUIData.width = getIntValue(node, "width");
            hubUIData.height = getIntValue(node, "height");

            JsonNode verticesNode = node.get("vertices");
            if (verticesNode != null) {
                Iterator<String> fieldItr = verticesNode.fieldNames();
                while (fieldItr.hasNext()) {
                    String key = fieldItr.next();
                    JsonNode vertexList = verticesNode.get(key);
                    if (vertexList != null) {
                        ArrayList<Point2D.Float> points = new ArrayList<>();

                        vertexList.forEach((JsonNode vertex) -> {
                            points.add(new Point2D.Float(vertex.get("x").asInt(), vertex.get("y").asInt()));
                        });
                        hubUIData.vertices.put(key, points);
                    }
                }
            }
        }
        return hubUIData;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        writeNumberIf(node, "x", x);
        writeNumberIf(node, "y", y);
        writeNumberIf(node, "width", width);
        writeNumberIf(node, "height", height);

        ObjectNode verticesNode = JsonNodeFactory.instance.objectNode();
        vertices.forEach((String key, List<Point2D.Float> points) -> {
            ArrayNode arrayOfPointsNode = JsonNodeFactory.instance.arrayNode();
            points.forEach((Point2D.Float point) -> {
                ObjectNode p = JsonNodeFactory.instance.objectNode();
                p.put("x", point.x);
                p.put("y", point.y);
                arrayOfPointsNode.add(p);
            });

            if (arrayOfPointsNode.size() > 0) {
                verticesNode.set(key, arrayOfPointsNode);
            }
        });
        node.set("vertices", verticesNode);
        return node;
    }
}
