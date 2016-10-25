package com.marklogic.quickstart.listeners;

public interface StatusListener {

    public void onStatusChange(int percentComplete, String message);
    public void onError();
}
