package com.marklogic.quickstart.service;

import com.marklogic.hub.HubConfig;
import org.springframework.stereotype.Component;

import java.nio.file.Path;
import java.nio.file.WatchEvent;

@Component
public interface FileSystemEventListener {

    void onWatchEvent(HubConfig hubConfig, Path path, WatchEvent<Path> event);
}
