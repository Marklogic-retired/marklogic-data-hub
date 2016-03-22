package com.marklogic.hub.model;

public class RestModel {

    private String entityName;
    private boolean isSynched;

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
    }

    public boolean isSynched() {
        return isSynched;
    }

    public void setSynched(boolean isSynched) {
        this.isSynched = isSynched;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("entityName=");
        sb.append(entityName);
        sb.append("isSynched=");
        sb.append(isSynched);
        sb.append("}");

        return sb.toString();
    }
}
