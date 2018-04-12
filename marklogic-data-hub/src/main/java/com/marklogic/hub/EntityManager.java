/*
 * Copyright 2012-2018 MarkLogic Corporation
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

import com.marklogic.hub.impl.EntityManagerImpl;

import java.util.HashMap;

/**
 * Manages existing entities' MarkLogic Server database index settings and query options.
 */
public interface EntityManager {
    /**
     * Creates and returns the EntityManager object
     * @param hubConfig - the hubConfig for the EntityManager to use
     * @return an EntityManager object with a set hubConfig
     */
    static EntityManager create(HubConfig hubConfig) {
       return new EntityManagerImpl(hubConfig);
    }

    /**
     * Updates the query options to the file system
     * @return boolean - if it fails to so, false is returned
     */
    boolean saveQueryOptions();

    /**
     * Deploys the query option
     * @return hashmap - ENUM DatabaseKind of what database and boolean if the deploy was successful or not.
     */
    HashMap<Enum, Boolean> deployQueryOptions();

    /**
     * Updates the indexes for the entity on the filesystem
     * @return boolean - if it fails to do so, false is returned
     */
    boolean saveDbIndexes();

    /**
     * Scans the entities in the project for pii properties, and saves the
     * required ELS configurations to support those properties.
     */
    public boolean savePii();
}
