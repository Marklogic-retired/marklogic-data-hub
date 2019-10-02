/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.model;

import java.util.HashMap;
import java.util.Map;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonRawValue;

@XmlRootElement(name = "Document")
@XmlAccessorType(XmlAccessType.FIELD)
public class Document {

  @JsonRawValue
  private final String content;
  private final Map<String, String> metaData;

  private Document() {
    this("", null);
  }

  public Document(String content, Map<String, String> metaData) {
    this.content = content;
    this.metaData = (metaData != null) ? metaData : new HashMap<>();
  }

  public String getContent() {
    return content;
  }

  public Map<String, String> getMetaData() {
    return metaData;
  }
}
