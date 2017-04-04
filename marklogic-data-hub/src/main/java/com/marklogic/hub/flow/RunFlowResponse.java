package com.marklogic.hub.flow;

import javax.xml.bind.annotation.XmlRootElement;
import java.util.List;

@XmlRootElement(name = "runflowResponse")
public class RunFlowResponse {
    public long totalCount = 0;
    public long errorCount = 0;
    public List<String> completedItems;
    public List<String> failedItems;

    public String toString() {
        return "{totalCount: " + totalCount + ", errorCount: " + errorCount + ", completedItems: " + completedItems.size() + ", failedItems: " + failedItems.size() + "}";
    }
}
