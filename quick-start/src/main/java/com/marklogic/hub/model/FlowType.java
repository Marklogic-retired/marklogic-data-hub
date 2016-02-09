package com.marklogic.hub.model;

public enum FlowType {

	INPUT("input","Input Flow"), CONFORM("conform","Conformance Flow");
	
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
}
