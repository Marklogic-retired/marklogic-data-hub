/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.legacy.collector;

import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.security.InvalidParameterException;
import java.util.Iterator;
import java.util.Queue;
import java.util.Vector;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import static org.junit.Assert.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 *
 * @author Mads Hansen, MarkLogic Corporation
 */
public class DiskQueueTest extends HubTestBase {

    @Test
    public void testDiskQueue_sizeTooSmall() {
        assertThrows(InvalidParameterException.class, () -> {
            new DiskQueue<String>(0);
        });
    }

    @Test
    public void testDiskQueue_tempDirNotDir() throws IOException {
        assertThrows(InvalidParameterException.class, () -> {
            File tmpFile = File.createTempFile("tmp", "txt");
            new DiskQueue<String>(0, tmpFile);
        });
    }

    @Test
    public void testDiskQueue_tempFileDoesNotExist() throws IOException {
        assertThrows(InvalidParameterException.class, () -> {
            File tmpFile = new File("/does/not/exist");
            new DiskQueue<String>(0, tmpFile);
        });
    }

    @Test
    public void testDiskQueue_tempDirIsNull() throws IOException {
        assertThrows(InvalidParameterException.class, () -> {
            File tmpFile = null;
            new DiskQueue<String>(0, tmpFile);
        });
    }

    @Test
    public void testDiskQueue_tempDirDoesNotExist() throws IOException {
        assertThrows(InvalidParameterException.class, () -> {
            File tmpFile = Files.createTempDirectory("temp").toFile();
            tmpFile.delete();
            new DiskQueue<String>(0, tmpFile);
        });
    }

    @Test
    public void testDiskQueue_finalizeWhileOpen() throws IOException, Throwable {
        DiskQueue<String> instance = new DiskQueue<String>(1);
        instance.add("first");
        instance.add("second");
        instance.add("third");
        assertEquals(3, instance.size());
        instance.finalize();
    }

    @Test
    public void testDiskQueue_loadFromFile() throws IOException, Throwable {
        String one = "one";
        String two = "two";
        String three = "three";
        Queue<String> instance = new DiskQueue<String>(1);
        assertEquals(0, instance.size());
        instance.add(one);
        assertEquals(1, instance.size());
        instance.add(two);
        assertEquals(2, instance.size());
        instance.add(three);
        assertEquals(3, instance.size());
        assertEquals(one, instance.remove());
        assertEquals(two, instance.remove());
        assertEquals(three, instance.remove());
        assertEquals(0, instance.size());
    }

    /**
     * Test of finalize method, of class DiskQueue.
     */
    @Test
    public void testFinalize() throws Exception {
        DiskQueue<String> instance = new DiskQueue<String>(1);
        try {
            instance.finalize();
        } catch (Throwable ex) {
            fail();
        }
    }

    /**
     * Test of iterator method, of class DiskQueue.
     */
    @Test
    public void testIterator() {
        Queue<String> instance = new DiskQueue<String>(1);
        Iterator<String> iterator = instance.iterator();
        assertFalse(iterator.hasNext());

        instance.add("1");
        instance.add("2");
        instance.add("3");
        iterator = instance.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("1", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("2", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("3", iterator.next());
        assertFalse(iterator.hasNext());
    }

    /**
     * Test of iterator method, of class DiskQueue.
     */
    @Test
    public void testIterator2() {
        Queue<String> instance = new DiskQueue<String>(3);
        Iterator<String> iterator = instance.iterator();
        assertFalse(iterator.hasNext());

        instance.add("1");
        instance.add("2");
        instance.add("3");
        iterator = instance.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("1", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("2", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("3", iterator.next());
        assertFalse(iterator.hasNext());
    }

    /**
     * Test of iterator in multithreaded run, of class DiskQueue.
     */
    @Test
    public void testIteratorMultiThreaded() throws InterruptedException {
        Queue<String> instance = new DiskQueue<String>(1);
        Iterator<String> iterator = instance.iterator();
        assertFalse(iterator.hasNext());

        int count = 100000;
        for (int i = 0; i < count; i++) {
            instance.add(Integer.toString(i));
        }

        int threadCount = 8;

        Vector<String> results = new Vector<>();
        ThreadPoolExecutor tpe = new ThreadPoolExecutor(threadCount, threadCount, 0, TimeUnit.MILLISECONDS, new LinkedBlockingQueue<Runnable>(20), new ThreadPoolExecutor.CallerRunsPolicy());
        tpe.execute(() -> {
            Iterator<String> it = instance.iterator();

            while ( it.hasNext() ) {
                results.add(it.next());
            }
        });
        tpe.awaitTermination(2, TimeUnit.SECONDS);

        assertEquals(count, results.size());
    }

    /**
     * Test of size method, of class DiskQueue.
     */
    @Test
    public void testSize() {
        Queue<String> instance = new DiskQueue<String>(1);
        assertEquals(0, instance.size());
        instance.add("testSize");
        int result = instance.size();
        assertEquals(1, result);
        instance.add("testSize2");
        assertEquals(2, instance.size());
    }

    /**
     * Test of offer method, of class DiskQueue.
     */
    @Test
    public void testOffer() {
        Queue<String> instance = new DiskQueue<String>(1);
        boolean result = instance.offer("test1");
        assertTrue(result);
    }

    @Test
    public void testOffer_null() {
        assertThrows(NullPointerException.class, () -> {
            Queue<String> instance = new DiskQueue<String>(1);
            instance.offer(null);
        });
    }

    /**
     * Test of peek method, of class DiskQueue.
     */
    @Test
    public void testPeek() {
        Queue<String> instance = new DiskQueue<String>(1);
        assertNull(instance.peek());
        String item = "testPeek";
        instance.add(item);
        assertEquals(item, instance.peek());
    }

    /**
     * Test of remove method, of class DiskQueue.
     */
    @Test
    public void testRemove() {
        Queue<String> instance = new DiskQueue<String>(1);
        String element = "testRemove";
        instance.add(element);
        String result = instance.remove();
        assertEquals(element, result);
    }

    @Test
    public void testRemove_whenEmpty() {
        assertThrows(IndexOutOfBoundsException.class, () -> {
            Queue<String> instance = new DiskQueue<String>(1);
            instance.remove();
        });
    }

    /**
     * Test of poll method, of class DiskQueue.
     */
    @Test
    public void testPoll() {
        Queue<String> instance = new DiskQueue<String>(1);
        String element = "testPoll";
        instance.add(element);
        Object result = instance.poll();
        assertEquals(element, result);
    }

    @Test
    public void testPoll_whenEmpty() {
        DiskQueue<String> instance = new DiskQueue<String>(1);
        Object result = instance.poll();
        assertNull(result);
    }

    /**
     * Test of clear method, of class DiskQueue.
     */
    @Test
    public void testClear() {
        Queue<String> instance = new DiskQueue<String>(1);
        instance.add("testClear");
        instance.clear();
        assertEquals(0, instance.size());
    }

}
