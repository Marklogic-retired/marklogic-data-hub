package com.marklogic.hub.model;

public enum FlowType {

 INPUT("input", "Input Flow"), HARMONIZE("harmonize", "Harmonize Flow");

 public String name;
 public String type;

 FlowType(String name, String type) {
  this.name = name;
  this.type = type;
 }

 public String getName() {
  return name;
 }

 public String getType() {
  return type;
 }

 public static FlowType getFlowType(String type) {
  for (FlowType flowType : FlowType.values()) {
   if (flowType.getName().equals(type)) {
    return flowType;
   }
  }
  return null;
 }

 public String toString() {
     return name;
 }
}
