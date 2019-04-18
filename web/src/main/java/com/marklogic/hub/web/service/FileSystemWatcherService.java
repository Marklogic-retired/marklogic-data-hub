/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web.service;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import com.sun.nio.file.SensitivityWatchEventModifier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.WatchEvent.Kind;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;

@Service
public class FileSystemWatcherService implements DisposableBean {

    private WatchService _watcher = null;
    // needs to have class scope so that it doesn't go away
    private Thread watcherThread;
    private Map<WatchKey,Path> keys = new HashMap<>();

    private static Logger logger = LoggerFactory.getLogger(FileSystemWatcherService.class);

    @Autowired
    private HubConfigImpl hubConfig;

    private final List<FileSystemEventListener> listeners = Collections.synchronizedList(new ArrayList<>());

    private WatchService watcher() throws IOException {
        if (_watcher == null) {
            _watcher = FileSystems.getDefault().newWatchService();
            watcherThread = new DirectoryWatcherThread("directory-watcher-thread", hubConfig);
            watcherThread.start();
        }
        return _watcher;
    }

    public synchronized void unwatch(String pathName) throws IOException {
        unregisterAll(Paths.get(pathName));
    }

    public synchronized void watch(String pathName) throws IOException {
        registerAll(Paths.get(pathName));
    }

    public void addListener(FileSystemEventListener listener) {
        listeners.add(listener);
    }

    public boolean hasListener(FileSystemEventListener listener) {
        return listeners.contains(listener);
    }

    public void removeListener(FileSystemEventListener listener) {
        listeners.remove(listener);
    }

    private void notifyListeners(HubConfig hubConfig) {
        // notify global listeners
        synchronized (listeners) {
            for (FileSystemEventListener listener : listeners) {
                try {
                    listener.onWatchEvent(hubConfig);
                }
                catch (Exception e) {
                    logger.error("Exception occured on listener", e);
                }
            }
        }
    }

    /**
     * Register the given directory with the WatchService
     */
    private void register(Path dir) throws IOException {
        WatchKey key = dir.register(watcher(), new Kind[]{StandardWatchEventKinds.ENTRY_CREATE, StandardWatchEventKinds.ENTRY_DELETE, StandardWatchEventKinds.ENTRY_MODIFY}, SensitivityWatchEventModifier.HIGH);
        if (logger.isInfoEnabled()) {
            Path prev = keys.get(key);
            if (prev == null) {
                logger.info("register: {}", dir);
            } else {
                if (!dir.equals(prev)) {
                    logger.info("update: {} -> {}", prev, dir);
                }
            }
        }
        keys.putIfAbsent(key, dir);
    }

    private void unregister(Path dir) throws IOException {
        Iterator<Map.Entry<WatchKey, Path>> it = keys.entrySet().iterator();
        while(it.hasNext()) {
            Map.Entry<WatchKey, Path> entry = it.next();
            WatchKey key = entry.getKey();
            Path watchPath = entry.getValue();
            if (watchPath.equals(dir)) {
                logger.info("unregister: {}", dir);
                key.cancel();
                it.remove();
            }
        }
    }

    /**
     * Register the given directory and all its sub-directories with the WatchService.
     */
    private void registerAll(final Path start) throws IOException {
        // register directory and sub-directories
        Files.walkFileTree(start, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                throws IOException
            {
                register(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    private void unregisterAll(final Path start) throws IOException {
        // register directory and sub-directories
        Files.walkFileTree(start, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                throws IOException
            {
                unregister(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    @Override
    public synchronized void destroy() throws Exception {
        if (watcher() != null) {
            watcher().close();
        }
    }

    private class DirectoryWatcherThread extends Thread {

        private HubConfig hubConfig;
        private final int DELAY = 1000;

        Timer processDelayTimer = null;

        DirectoryWatcherThread(String name, HubConfig hubConfig) {
            super(name);
            this.hubConfig = hubConfig;
        }

        private synchronized void queueReload() {
            if (processDelayTimer != null) {
                processDelayTimer.cancel();
            }
            processDelayTimer = new Timer();
            processDelayTimer.schedule(new TimerTask() {
                @Override
                public void run() {
                    notifyListeners(hubConfig);
                }
            }, DELAY);
        }

        @Override
        public void run() {
            for (;;) {
                // wait for key to be signaled
                WatchKey key;
                try {
                    key = watcher().take();
                } catch (IOException | InterruptedException | ClosedWatchServiceException e ) {
                    return;
                }

                Path dir = keys.get(key);
                if (dir == null) {
                    logger.info("WatchKey not recognized!!");
                    continue;
                }

                for (WatchEvent<?> event: key.pollEvents()) {
                    Kind<?> kind = event.kind();
//                    if (kind == StandardWatchEventKinds.OVERFLOW) {
//                        continue;
//                    }

                    queueReload();

                    // if directory is created, then register it and its sub-directories
                    // we are always listening recursively
                    if (kind == StandardWatchEventKinds.ENTRY_CREATE) {
                        // Context for directory entry event is the file name of entry
                        @SuppressWarnings("unchecked")
                        WatchEvent<Path> ev = (WatchEvent<Path>)event;
                        Path context = ev.context();
                        Path child = dir.resolve(context);

                        try {
                            // print out event
                            logger.debug("Event received: {} for: {}", event.kind().name(), child);

                            if (Files.isDirectory(child, LinkOption.NOFOLLOW_LINKS)) {
                                registerAll(child);
                            }
                        } catch (IOException x) {
                            logger.error("Cannot watch newly created directory: " + child.getFileName().toAbsolutePath(), x);
                        }
                    }
                }

                // reset key and remove from set if directory no longer accessible
                boolean valid = key.reset();
                if (!valid) {
                    keys.remove(key);

                    // all directories are inaccessible
                    if (keys.isEmpty()) {
                        break;
                    }
                }
            }
        }
    }
}
