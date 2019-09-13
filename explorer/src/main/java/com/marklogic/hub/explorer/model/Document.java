package com.marklogic.hub.explorer.model;

import java.util.HashMap;
import java.util.Map;

import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonRawValue;

@XmlRootElement(name = "Document")
public class Document {

  @JsonRawValue
  private String content;

  private Map<String, String> metaData;

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public Map<String, String> getMetaData() {
    return metaData;
  }

  public void setMetaData(Map<String, String> metaData) {
    this.metaData = (metaData != null) ? metaData : new HashMap<>();
  }
}
