package com.marklogic.hub;

public interface StatusListener {

    public void onStatusChange(int percentComplete, String message);
}
