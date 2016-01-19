/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub;

import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class DefaultCollectorOptions {
    private Collection collection;
    private Directory directory;

    public Collection getCollection() {
        return collection;
    }

    public void setCollection(Collection collection) {
        this.collection = collection;
    }

    public Directory getDirectory() {
        return directory;
    }

    public void setDirectory(Directory directory) {
        this.directory = directory;
    }

    public void addCollection(String collectionUri) {
        if (null == collection) {
            collection = new Collection();
        }
        collection.uris.add(collectionUri);
    }

    public void setDirectoryDepth(String depth) {
        if (null == directory) {
            directory = new Directory();
        }
        directory.depth = depth;
    }

    public void addDirectory(String directoryUri) {
        if (null == directory) {
            directory = new Directory();
        }
        directory.uris.add(directoryUri);
    }

    public static class Collection {
        public ArrayList<String> uris = new ArrayList<String>();
    }

    public static class Directory {
        public ArrayList<String> uris = new ArrayList<String>();
        public String depth = "infinity";
    }
}
