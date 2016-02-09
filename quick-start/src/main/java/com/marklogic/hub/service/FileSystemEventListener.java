package com.marklogic.hub.service;

import java.nio.file.Path;
import java.nio.file.WatchEvent;

public interface FileSystemEventListener {

    void onWatchEvent(Path path, WatchEvent<Path> event);
}
