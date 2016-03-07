package com.marklogic.hub.util;

import com.marklogic.hub.model.FlowType;

public class UserPluginFileInfo {
        private String entityName;
        private String flowName;
        private FlowType flowType;
        
        public UserPluginFileInfo(String entityName, String flowName, FlowType flowType) {
            this.entityName = entityName;
            this.flowName = flowName;
            this.flowType = flowType;
        }
        
        public String getEntityName() {
            return entityName;
        }
        
        public String getFlowName() {
            return flowName;
        }
        
        public FlowType getFlowType() {
            return flowType;
        }
    }