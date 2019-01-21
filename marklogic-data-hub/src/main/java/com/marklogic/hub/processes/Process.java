package com.marklogic.hub.processes;

import com.fasterxml.jackson.databind.JsonNode;

public interface Process {

    enum ProcessType {
        INGEST("ingest"),
        MAPPING("mapping"),
        CUSTOM("custom");

        private String type;

        ProcessType(String type) {
            this.type = type;
        }

        public static ProcessType getProcessType(String type) {
            for (ProcessType processType : ProcessType.values()) {
                if (processType.toString().equals(type)) {
                    return processType;
                }
            }
            return null;
        }

        public String toString() {
            return this.type;
        }
    }

    /**
     * Returns the name of the processes
     *
     * @return a processes name
     */
    String getProcessName();

    /**
     * Sets the name of the processes
     *
     * @param processName - a processes name
     */
    void setProcessName(String processName);

    /**
     * Returns the type of the Process
     *
     * @return - a processes type
     */
    ProcessType getProcessType();

    /**
     * Sets the type of the processes
     *
     * @param processType - a processes type
     */
    void setProcessType(ProcessType processType);

    /**
     * Serializes the mapping as a json string
     *
     * @return the serialized JSON string
     */
    String serialize();

    /**
     * Deserializes a json response and applies it to this mapping
     *
     * @param json - the JsonNode you want deserialize
     * @return this mapping
     */
    Process deserialize(JsonNode json);
}
