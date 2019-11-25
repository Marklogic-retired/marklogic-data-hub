package com.marklogic.explorer.integral.support;

/*
 * JsonUtils.java
 *
 * Copyright (c) 2019 MarkLogic Corp.  All rights reserved.
 *
 * This is yet another flavor of using jackson to convert objects to/from strings.
 * In all likelihood, this probably resembles at least 20 similar implementations
 *
 * Note:  At present, there are some limitations of use, particularly with some types
 * such as enums and Optional.  Fixing this is a a "to-do" -- but not in this class.
 */
import com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import java.io.IOException;

public class JsonUtils {
  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final ObjectWriter WRITER = MAPPER.writer();

  static {
    MAPPER.registerModule(new Jdk8Module());
    MAPPER.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
    MAPPER.configure(SerializationFeature.WRITE_NULL_MAP_VALUES, false); // may not need this
    MAPPER.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
    MAPPER.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    MAPPER.setVisibility(PropertyAccessor.FIELD, Visibility.ANY);
    MAPPER.setSerializationInclusion(Include.NON_NULL);

  }

  /**
   * toJson converts obj to its json representation.
   * Note that Jackson limitations
   * may make some things fail that one wouldn't think would
   * @param obj
   * @return
   */
  public static String toJson(Object obj) {
    try {
      return WRITER.writeValueAsString(obj);
    } catch (IOException e) {
      throw new RuntimeException("Cannot serialize "+obj, e);
    }
  }

  /**
   * fromJson converts the supplied json to the specified klass.
   * Note that jackson doesn't always recognize some constructs,
   * particularly in enums and OPtional seems to be something else
   * @param json -
   * @param klass -
   * @param <T> - type
   * @return
   */
  public static <T> T fromJson(String json, Class<T> klass) {
    try {
      return MAPPER.readValue(json, klass);
    } catch (IOException e) {
      throw new RuntimeException("Cannot deserialize "+json, e);
    }
  }
}
