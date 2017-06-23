package com.marklogic.hub;

public enum HubDatabase {
    STAGING("staging"),
    FINAL("final");

    private String type;
    HubDatabase(String type) {
        this.type = type;
    }

    public static HubDatabase getHubDatabase(String database) {
        for (HubDatabase hubDatabase : HubDatabase.values()) {
            if (hubDatabase.toString().equals(database)) {
                return hubDatabase;
            }
        }
        return null;
    }

    public String toString() {
        return this.type;
    }
}
