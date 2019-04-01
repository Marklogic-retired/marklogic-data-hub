package com.marklogic.hub.util.json;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
     * @param json
     */
    public JSONObject(JsonNode json) {
        if (json == null) {
            this.json = JsonNodeFactory.instance.objectNode();
        } else {
            this.json = json;
        }
    }

    /**
     *
     * @param jsonString
     * @return
     * @throws IOException
     */
    public static JsonNode readInput(String jsonString) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(jsonString, JsonNode.class);
    }

    /**
     * @param istream
     * @return
     * @throws IOException
     */
    public static JsonNode readInput(InputStream istream) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readTree(istream);
    }

    /**
     * @param reader
     * @return
     * @throws IOException
     */
    public static JsonNode readInput(Reader reader) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readTree(reader);
    }

    /**
     * @param obj
     * @return
     * @throws JsonProcessingException
     */
    public static String writeValueAsString(Object obj) throws JsonProcessingException {
        return writeValueAsString(obj, true);
    }

    /**
     * @param obj
     * @param hasPrettyPrint
     * @return
     * @throws JsonProcessingException
     */
    public static String writeValueAsString(Object obj, boolean hasPrettyPrint) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        if (hasPrettyPrint) {
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
        }
        return mapper.writeValueAsString(obj);
    }

    public JsonNode jsonNode() {
        return this.json;
    }

    public ObjectMapper getMapper() {
        return mapper;
    }

    @Override
    public String toString() {
        return json.toString();
    }

    /**
     * @param key
     * @return
     */
    public boolean isExist(String key) {
        return json.has(key);
    }

    /**
     * @param key
     * @return
     */
    public int getJsonArraySize(String key) {
        if (json.get(key).isArray()) {
            return json.get(key).size();
        }
        return 0;
    }

    public JsonNode getNode(Object key) {
        return getNode(key, null);
    }

    /**
     * @param key
     * @param defaultVal
     * @return
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
     * @param key
     * @return
     */
    public String getString(Object key) {
        return getString(key, null);
    }

    /**
     * @param key
     * @param defaultVal
     * @return
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
     * @param key
     * @return
     */
    public int getInt(String key) {
        return getInt(key, 0);
    }

    /**
     * @param key
     * @param defaultVal
     * @return
     */
    public int getInt(Object key, int defaultVal) {
        return json.get((String) key) == null ? defaultVal : json.get((String) key).asInt();
    }

    /**
     * @param key
     * @return
     */
    public Boolean getBoolean(String key) {
        return getBoolean(key, false);
    }

    /**
     * @param key
     * @param defaultVal
     * @return
     */
    public Boolean getBoolean(Object key, Boolean defaultVal) {
        return json.get((String) key) == null ? defaultVal : json.get((String) key).asBoolean();
    }

    /**
     * @param key
     * @return
     */
    public long getLong(String key) {
        return getLong(key, 0L);
    }

    /**
     * @param key
     * @param defaultVal
     * @return
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
     * @param key
     * @return
     */
    public List<Object> getArray(String key) {
        List<Object> listObj = new ArrayList<>();
        for (JsonNode s : json.get(key)) {
            listObj.add(s);
        }
        return listObj;
    }

    /**
     *
     * @param key
     * @return
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
     *
     * @param map
     * @return
     * @throws JsonProcessingException
     */
    public String convertMapToJsonString(Map<String, Object> map) throws JsonProcessingException {
        putMap(map);
        if (map == null) {
            mapper = new ObjectMapper();
        }
        return mapper.writeValueAsString(json);
    }

    /**
     *
     * @param map
     */
    public void putMap(Map<String, Object> map) {
        for (String key : map.keySet()) {
            put(key, map.get(key));
        }
    }

    /**
     * @param key
     * @return
     */
    public List<String> getArrayString(String key) {
        List<String> listString = new ArrayList<>();
        for (JsonNode s : json.get(key)) {
            listString.add(s.asText());
        }
        return listString;
    }

    /**
     * @param key
     * @param val
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
     * single key array node
     *
     * @param key
     * @param vals
     */
    public void putArray(String key, Object... vals) {
        List<Object> lstVal = new ArrayList<>();
        Collections.addAll(lstVal, vals);
        putArray(key, lstVal);
    }

    /**
     * single key array node
     *
     * @param key
     * @param valList
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

    public void prettyPrint() {
        try {
            logger.info(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
