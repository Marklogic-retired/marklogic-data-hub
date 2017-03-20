package com.marklogic.hub;

public enum HubDatabase {
    STAGING("staging"),
    FINAL("final");

    private String type;
    HubDatabase(String type) {
        this.type = type;
    }

    public static HubDatabase getHubDatabase(String status) {
        for (HubDatabase hubDatabase : HubDatabase.values()) {
            if (hubDatabase.toString().equals(status)) {
                return hubDatabase;
            }
        }
        return null;
    }

    public String toString() {
        return this.type;
    }
}
