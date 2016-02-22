package com.marklogic.hub.util;

import com.marklogic.hub.model.FlowType;

public class UserPluginFileInfo {
        private String domainName;
        private String flowName;
        private FlowType flowType;
        
        public UserPluginFileInfo(String domainName, String flowName, FlowType flowType) {
            this.domainName = domainName;
            this.flowName = flowName;
            this.flowType = flowType;
        }
        
        public String getDomainName() {
            return domainName;
        }
        
        public String getFlowName() {
            return flowName;
        }
        
        public FlowType getFlowType() {
            return flowType;
        }
    }