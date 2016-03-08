package com.marklogic.hub.model;

public class FlowModel {

    private String entityName;
    private String flowName;
    private boolean isSynched;
    private TreeData treeData;

    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;

    }

    public String getFlowName() {
        return flowName;
    }

    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    public boolean isSynched() {
        return isSynched;
    }

    public void setSynched(boolean isSynched) {
        this.isSynched = isSynched;
    }

    public TreeData getTreeData() {
        return treeData;
    }

    public void setTreeData(TreeData treeData) {
        this.treeData = treeData;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("entityName=");
        sb.append(entityName);
        sb.append("flowName=");
        sb.append(flowName);
        sb.append("isSynched=");
        sb.append(isSynched);
        sb.append("}");

        return sb.toString();
    }
}
