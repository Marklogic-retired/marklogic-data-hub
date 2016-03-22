package com.marklogic.hub.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardWatchEventKinds;
import java.nio.file.WatchEvent;
import java.nio.file.WatchEvent.Kind;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.stereotype.Service;

@Service
public class FileSystemWatcherService implements DisposableBean {
    private static final Logger LOGGER = LoggerFactory.getLogger(FileSystemWatcherService.class);

    private WatchService watcher;
    private Thread watcherThread;
    private Map<WatchKey,Path> keys = new HashMap<>();

    private List<FileSystemEventListener> listeners = Collections.synchronizedList(new ArrayList<>());
    private Map<Path, FileSystemEventListener> pathListeners = Collections.synchronizedMap(new HashMap<>());

    @PostConstruct
    protected synchronized void onPostConstruct() throws Exception {
        watcher = FileSystems.getDefault().newWatchService();

        watcherThread = new DirectoryWatcherThread("directory-watcher-thread");
        watcherThread.start();
    }

    /**
     * Recursively listen for file system events in the specified path name.
     *
     * @param pathName
     * @throws IOException
     */
    public synchronized void watch(String pathName) throws IOException {
        watch(pathName, null);
    }

    public synchronized void watch(String pathName, FileSystemEventListener listener) throws IOException {
        File file = new File(pathName);
        Path path = file.toPath();

        pathListeners.put(path, listener);

        registerAll(path);
    }

    public void addListener(FileSystemEventListener listener) {
        listeners.add(listener);
    }

    public void removeListener(FileSystemEventListener listener) {
        listeners.remove(listener);
    }

    protected void notifyListeners(Path path, WatchEvent<Path> event) {
        // notify listeners on this path and this path's ancestors
        Path currentPath = path;
        while (currentPath != null) {
            FileSystemEventListener pathListener = pathListeners.get(currentPath);
            if (pathListener != null) {
                try {
                    pathListener.onWatchEvent(path, event);
                }
                catch (Exception e) {
                    LOGGER.error("Exception occured on listener", e);
                }
            }

            currentPath = currentPath.getParent();
        }

        // notify global listeners
        synchronized (listeners) {
            for (FileSystemEventListener listener : listeners) {
                try {
                    listener.onWatchEvent(path, event);
                }
                catch (Exception e) {
                    LOGGER.error("Exception occured on listener", e);
                }
            }
        }
    }

    /**
     * Register the given directory with the WatchService
     */
    private void register(Path dir) throws IOException {
        WatchKey key = dir.register(watcher, StandardWatchEventKinds.ENTRY_CREATE, StandardWatchEventKinds.ENTRY_DELETE, StandardWatchEventKinds.ENTRY_MODIFY);
        if (LOGGER.isTraceEnabled()) {
            Path prev = keys.get(key);
            if (prev == null) {
                LOGGER.trace("register: {}", dir);
            } else {
                if (!dir.equals(prev)) {
                    LOGGER.trace("update: {} -> {}", prev, dir);
                }
            }
        }
        keys.put(key, dir);
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

    @Override
    public synchronized void destroy() throws Exception {
        watcher.close();
    }

    @SuppressWarnings("unchecked")
    static <T> WatchEvent<T> cast(WatchEvent<?> event) {
        return (WatchEvent<T>)event;
    }

    private class DirectoryWatcherThread extends Thread {

        public DirectoryWatcherThread(String name) {
            super(name);
        }

        @Override
        public void run() {
            for (;;) {
                // wait for key to be signaled
                WatchKey key;
                try {
                    key = watcher.take();
                } catch (InterruptedException x) {
                    return;
                }

                Path dir = keys.get(key);
                if (dir == null) {
                    LOGGER.trace("WatchKey not recognized!!");
                    continue;
                }

                for (WatchEvent<?> event: key.pollEvents()) {
                    Kind<?> kind = event.kind();
                    if (kind == StandardWatchEventKinds.OVERFLOW) {
                        continue;
                    }

                    // Context for directory entry event is the file name of entry
                    WatchEvent<Path> ev = cast(event);
                    Path context = ev.context();
                    Path child = dir.resolve(context);

                    // print out event
                    LOGGER.trace("Event received: %s for: %s", event.kind().name(), child);

                    // notify listeners
                    notifyListeners(dir, ev);

                    // if directory is created, then register it and its sub-directories
                    // we are always listening recursively
                    if (kind == StandardWatchEventKinds.ENTRY_CREATE) {
                        try {
                            if (Files.isDirectory(child, LinkOption.NOFOLLOW_LINKS)) {
                                registerAll(child);
                            }
                        } catch (IOException x) {
                            LOGGER.error("Cannot watch newly created directory: " + child.getFileName().toAbsolutePath(), x);
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
