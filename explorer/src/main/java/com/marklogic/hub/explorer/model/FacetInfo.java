package com.marklogic.hub.explorer.model;

public class FacetInfo {

  private String entityTypeId;
  private String propertyPath;
  private String referenceType;

  public String getEntityTypeId() {
    return entityTypeId;
  }

  public void setEntityTypeId(String entityTypeId) {
    this.entityTypeId = entityTypeId;
  }

  public String getPropertyPath() {
    return propertyPath;
  }

  public void setPropertyPath(String propertyPath) {
    this.propertyPath = propertyPath;
  }

  public String getReferenceType() {
    return referenceType;
  }

  public void setReferenceType(String referenceType) {
    this.referenceType = referenceType;
  }
}
