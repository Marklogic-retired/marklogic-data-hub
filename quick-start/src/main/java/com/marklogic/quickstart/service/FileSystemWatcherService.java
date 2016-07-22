package com.marklogic.quickstart.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.WatchEvent.Kind;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.*;

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
    public synchronized void unwatch(String pathName) throws IOException {
        unregisterAll(Paths.get(pathName));
    }

    public synchronized void watch(String pathName) throws IOException {
        registerAll(Paths.get(pathName));
    }

    public void addListener(FileSystemEventListener listener) {
        listeners.add(listener);
    }

    public void removeListener(FileSystemEventListener listener) {
        listeners.remove(listener);
    }

    protected void notifyListeners(Path path, WatchEvent<Path> event) {
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
        if (LOGGER.isInfoEnabled()) {
            Path prev = keys.get(key);
            if (prev == null) {
                LOGGER.info("register: {}", dir);
            } else {
                if (!dir.equals(prev)) {
                    LOGGER.info("update: {} -> {}", prev, dir);
                }
            }
        }
        keys.put(key, dir);
    }

    private void unregister(Path dir) throws IOException {
        Iterator<Map.Entry<WatchKey, Path>> it = keys.entrySet().iterator();
        while(it.hasNext()) {
            Map.Entry<WatchKey, Path> entry = it.next();
            WatchKey key = entry.getKey();
            if (key.equals(dir)) {
                LOGGER.info("unregister: {}", dir);
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
                } catch (InterruptedException | ClosedWatchServiceException e ) {
                    return;
                }

                Path dir = keys.get(key);
                if (dir == null) {
                    LOGGER.info("WatchKey not recognized!!");
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
                    LOGGER.info("Event received: %s for: %s", event.kind().name(), child);

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
