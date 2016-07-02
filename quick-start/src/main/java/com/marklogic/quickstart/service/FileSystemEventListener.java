package com.marklogic.quickstart.service;

import java.nio.file.Path;
import java.nio.file.WatchEvent;

import org.springframework.stereotype.Component;

@Component
public interface FileSystemEventListener {

    void onWatchEvent(Path path, WatchEvent<Path> event);
}
