package com.marklogic.hub.util.json;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.util.*;

public class JSONObject {
    private static Logger logger = LoggerFactory.getLogger(JSONObject.class);

    ObjectMapper mapper;
    JsonNode json;

    public JSONObject() {
        this(false);
    }

    public JSONObject(boolean createMapper) {
        if (createMapper) {
            mapper = new ObjectMapper();
        }
        json = JsonNodeFactory.instance.objectNode();
    }

    public JSONObject(Object dataVal) throws IOException {
        try {
            mapper = new ObjectMapper();
            if (dataVal instanceof String) {
                json = mapper.readValue((String) dataVal, JsonNode.class);
            } else if (dataVal instanceof byte[]) {
                json = mapper.readValue((byte[]) dataVal, JsonNode.class);
            } else if (dataVal instanceof JsonNode) {
                if (dataVal == null) {
                    json = mapper.createObjectNode();
                } else {
                    json = (JsonNode) dataVal;
                }
            } else if (dataVal instanceof File) {
                json = mapper.readValue((File) dataVal, JsonNode.class);
            } else {
                throw new IOException("Unknown type");
            }

        } catch (JsonParseException e) {
            throw new IOException(e);
        }
    }

    /**
     * @param json json node object
     */
    public JSONObject(JsonNode json) {
        if (json == null) {
            this.json = JsonNodeFactory.instance.objectNode();
        } else {
            this.json = json;
        }
    }

    /**
     * Returns a Json node instance from a json String
     * @param jsonString json string
     * @return a json node
     * @throws IOException if I/O error occurs
     */
    public static JsonNode readInput(String jsonString) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(jsonString, JsonNode.class);
    }

    /**
     * Returns a Json node instance from an input stream
     * @param istream input stream object
     * @return a json node
     * @throws IOException if I/O error occurs
     */
    public static JsonNode readInput(InputStream istream) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readTree(istream);
    }

    /**
     * Returns a Json node instance from an input reader
     * @param reader reader object
     * @return a json node
     * @throws IOException if I/O error occurs
     */
    public static JsonNode readInput(Reader reader) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readTree(reader);
    }

    /**
     * Returns a json string from an Object with pretty print
     * @param obj object to be serialized
     * @return a string object
     * @throws JsonProcessingException if problem with processing json
     */
    public static String writeValueAsString(Object obj) throws JsonProcessingException {
        return writeValueAsString(obj, true);
    }

    /**
     * Returns a json string from an Object with pretty print as a flag
     * @param obj object to be serialized
     * @param hasPrettyPrint boolean flag to pretty print
     * @return a string object
     * @throws JsonProcessingException if problem with processing json
     */
    public static String writeValueAsString(Object obj, boolean hasPrettyPrint) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();

        // Adding this so that the ObjectMapper in this class can be JsonIgnore'd.
        // Otherwise, serializing instances of this class can fail with the following error:
        // "No serializer found for class com.marklogic.hub.util.json.JSONObject and no properties discovered to create
        // BeanSerializer (to avoid exception, disable SerializationFeature.FAIL_ON_EMPTY_BEANS)"
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        if (hasPrettyPrint) {
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
        }
        return mapper.writeValueAsString(obj);
    }

    /**
     * Returns the json instance
     * @return a json node
     */
    public JsonNode jsonNode() {
        return this.json;
    }

    /**
     * Returns the mapper
     * @return an object mapper
     */
    @JsonIgnore
    public ObjectMapper getMapper() {
        return mapper;
    }

    @Override
    public String toString() {
        return json.toString();
    }

    /**
     * Checks if the key is existed or not
     * @param key json key
     * @return boolean flag indicating existence
     */
    public boolean isExist(String key) {
        return json.has(key);
    }

    /**
     * Gets json size if it is an array
     * @param key json key
     * @return size of array
     */
    public int getJsonArraySize(String key) {
        if (json.get(key).isArray()) {
            return json.get(key).size();
        }
        return 0;
    }

    /**
     * Gets a JsonNode value by key
     * @param key json key
     * @return a json node
     */
    public JsonNode getNode(Object key) {
        return getNode(key, null);
    }

    /**
     * Gets a JsonNode value by key with a default value
     * @param key a json key
     * @param defaultVal default json value to return of key not found
     * @return a json node
     */
    public JsonNode getNode(Object key, JsonNode defaultVal) {
        if (key == null) return null;
        if (key instanceof String) {
            return json.get((String) key) == null ? defaultVal : json.get((String) key);
        }
        if (key instanceof Integer) {
            return json.get((Integer) key) == null ? defaultVal : json.get((Integer) key);
        }

        logger.error("Object key: {} is not part of any known type", key);
        return null;
    }

    /**
     * Gets a String value by key
     * @param key a json key
     * @return a string value
     */
    public String getString(Object key) {
        return getString(key, null);
    }

    /**
     *  Gets a String value by key with a default value
     * @param key a json key
     * @param defaultVal default string value to return of key not found
     * @return string value
     */
    public String getString(Object key, String defaultVal) {
        if (key instanceof String) {
            return json.get((String) key) == null ? defaultVal : json.get((String) key).asText();
        }
        if (key instanceof Integer) {
            return json.get((Integer) key) == null ? defaultVal : json.get((Integer) key).asText();
        }
        return null;
    }

    /**
     * Gets a int value by key with 0 as default value
     * @param key a json key
     * @return an integer value
     */
    public int getInt(String key) {
        return getInt(key, 0);
    }

    /**
     * Gets a int value by key with a default value
     * @param key a json key
     * @param defaultVal default integer value to return of key not found
     * @return an integer value
     */
    public int getInt(Object key, int defaultVal) {
        return json.get((String) key) == null ? defaultVal : json.get((String) key).asInt();
    }

    /**
     * Gets a Boolean value by key
     * @param key a json key
     * @return a boolean value
     */
    public Boolean getBoolean(String key) {
        return getBoolean(key, false);
    }

    /**
     * Gets a Boolean value by key with a default value
     * @param key a json key
     * @param defaultVal default boolean value to return of key not found
     * @return a boolean value
     */
    public Boolean getBoolean(Object key, Boolean defaultVal) {
        return json.get((String) key) == null ? defaultVal : json.get((String) key).asBoolean();
    }

    /**
     * Gets a Long value by key
     * @param key a json key
     * @return a long value
     */
    public long getLong(String key) {
        return getLong(key, 0L);
    }

    /**
     * Gets a Long value by key with a default value
     * @param key a json key
     * @param defaultVal default long value to return of key not found
     * @return a long value
     */
    public long getLong(Object key, long defaultVal) {
        JsonNode obj = json.get((String) key);

        if (obj == null) {
            return defaultVal;
        }
        if (obj instanceof NullNode) {
            return defaultVal;
        }
        if (obj.isNumber()) {
            return obj.asLong();
        }
        if (obj.isTextual()) {
            return Long.parseLong(obj.asText());
        }
        throw new ClassCastException("get failed for " + key + ", expected long, got " + obj.getClass().getName());
    }

    /**
     * Gets a list of Objects by key
     * @param key a json key
     * @return a list of objects
     */
    public List<Object> getArray(String key) {
        List<Object> listObj = new ArrayList<>();
        for (JsonNode s : json.get(key)) {
            listObj.add(s);
        }
        return listObj;
    }

    /**
     * Gets a Map (String, Object) by key
     * @param key a json key
     * @return a map of (String, Object)
     */
    public Map<String, Object> getMap(String key) {
        Map<String, Object> mapObj = new HashMap<>();
        if (json.get(key) == null) {
            return mapObj;
        }
        Iterator<Map.Entry<String, JsonNode>> entryIterator =  json.get(key).fields();
        while (entryIterator.hasNext()) {
            Map.Entry<String, JsonNode> entry = entryIterator.next();
            mapObj.put(entry.getKey(), entry.getValue());
        }

        return mapObj;
    }

    /**
     * Converts a Map (String, Object) to a Json String
     * @param map a map of (String, Object)
     * @return a string
     * @throws JsonProcessingException if problem with processing json
     */
    public String convertMapToJsonString(Map<String, Object> map) throws JsonProcessingException {
        putMap(map);
        if (map == null) {
            mapper = new ObjectMapper();
        }
        return mapper.writeValueAsString(json);
    }

    /**
     * Puts map entries to the json instance
     * @param map a map of (String, Object)
     */
    public void putMap(Map<String, Object> map) {
        for (String key : map.keySet()) {
            put(key, map.get(key));
        }
    }

    /**
     * Gets a list of String by key with/without null values
     * @param key a json key
     * @param allowNull boolean flag to allow for null values
     * @return list of string values
     */
    public List<String> getArrayString(String key, boolean allowNull) {
        List<String> listString = new ArrayList<>();
        for (JsonNode s : json.get(key)) {
            if (allowNull || !s.isNull()) {
                listString.add(s.asText());
            }
        }
        return listString;
    }

    /**
     * Gets a list of String by key
     * @param key a json key
     * @return list of string values
     */
    public List<String> getArrayString(String key) {
        return getArrayString(key, true);
    }

    /**
     * Puts (key, value) pairs to the json instance
     * @param key a json key
     * @param val a json value
     */
    public void put(String key, Object val) {
        if (val instanceof String) {
            ((ObjectNode) json).put(key, (String) val);
        } else if (val instanceof Integer) {
            ((ObjectNode) json).put(key, (Integer) val);
        } else if (val instanceof Long) {
            ((ObjectNode) json).put(key, (Long) val);
        } else if (val instanceof Float) {
            ((ObjectNode) json).put(key, (Float) val);
        } else if (val instanceof Double) {
            ((ObjectNode) json).put(key, (Double) val);
        } else if (val instanceof Boolean) {
            ((ObjectNode) json).put(key, (Boolean) val);
        } else if (val instanceof JsonNode) {
            ((ObjectNode) json).set(key, (JsonNode) val);
        } else if (val instanceof JSONObject) {
            ((ObjectNode) json).set(key, ((JSONObject) val).jsonNode());
        } else {
            throw new ClassCastException("put failed for" + key + ", got " + val.getClass().getName());
        }
    }

    /**
     * Puts a number of Objects into Json Array of the json instance
     *
     * @param key a json key
     * @param vals a varargs for object/s
     */
    public void putArray(String key, Object... vals) {
        List<Object> lstVal = new ArrayList<>();
        Collections.addAll(lstVal, vals);
        putArray(key, lstVal);
    }

    /**
     * Puts a list of Objects into Json Array of the json instance
     *
     * @param key a json key
     * @param valList a list object of values
     */
    public void putArray(String key, List<?> valList) {
        ArrayNode array = ((ObjectNode) json).putArray(key);

        for (Object val : valList) {
            if (val instanceof String) {
                array.add((String) val);
            } else if (val instanceof Integer) {
                array.add((Integer) val);
            } else if (val instanceof Long) {
                array.add((Long) val);
            } else if (val instanceof Float) {
                array.add((Float) val);
            } else if (val instanceof JsonNode) {
                array.add((JsonNode) val);
            } else if (val instanceof JSONObject) {
                array.add(((JSONObject) val).jsonNode());
            } else {
                throw new ClassCastException("put failed for " + key + ", got " + val.getClass().getName());
            }
        }
    }

    /**
     * Makes pretty print for the json instance
     */
    public void prettyPrint() {
        try {
            logger.info(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
