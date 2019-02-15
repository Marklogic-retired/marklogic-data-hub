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

package com.marklogic.hub;

import com.marklogic.hub.impl.InstallInfoImpl;

/**
 * Stores and reports information from MarkLogic server about the installed status of the DHF
 *
 * This interface abstracts holding state. It does not make any calls itself.
 */
public interface InstallInfo {

    /**
     * Creates and returns an installinfo object
     * @return InstallInfo object
     */
    static InstallInfo create() {
        return new InstallInfoImpl();
    }

    /**
     * Returns if an install has been performed, but not complete
     * @return true if partially installed, false if not installed
     */
    boolean isPartiallyInstalled();

    /**
     * Checks if DHF has been installed
     * @return true if installed, false if not
     */
    boolean isInstalled();

    /**
     * Returns the entire object as a string
     * @return a string version the object
     */
    String toString();

    /**
     * Checks to see if the App Server is present and accessible
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return true if present, false if not found
     */
    boolean isAppServerExistent(DatabaseKind kind);

    /**
     * Sets the boolean property if the app server exists for the databasekind
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param stagingAppServerExists - true if it exists, false if it doesn't
     */
    void setAppServerExistent(DatabaseKind kind, boolean stagingAppServerExists);

    /**
     * Checks to see if the Database is present and accessible
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return true if present, false if not found
     */
    boolean isDbExistent(DatabaseKind kind);

    /**
     * Sets the boolean property if the database exists for the databasekind
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param stagingDbExists  - true if it exists, false if it doesn't
     */
    void setDbExistent(DatabaseKind kind, boolean stagingDbExists);

    /**
     * Checks to see if the triple index is set and on
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return true if present and enabled, false if not
     */
    boolean isTripleIndexOn(DatabaseKind kind);

    /**
     * Sets if the triple index is on or off by boolean
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param stagingTripleIndexOn - true if the triple index is on, false if it is not
     */
    void setTripleIndexOn(DatabaseKind kind, boolean stagingTripleIndexOn);

    /**
     * Checks to see if the lexicon collection is set and on
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return true if present and enabled, false if not
     */
    boolean isCollectionLexiconOn(DatabaseKind kind);

    /**
     * Sets if the collection lexicon is on or not
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param stagingCollectionLexiconOn - true if it's on, false if it's not
     */
    void setCollectionLexiconOn(DatabaseKind kind, boolean stagingCollectionLexiconOn);

    /**
     * Checks to see if the forests are present and accessible
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @return true if present, false if not found
     */
    boolean areForestsExistent(DatabaseKind kind);

    /**
     * Sets the boolean property if the forests exist for the databasekind
     * @param kind - DatabaseKind enum, eg: STAGING or JOB
     * @param stagingForestsExist  - true if it exists, false if it doesn't
     */
    void setForestsExistent(DatabaseKind kind, boolean stagingForestsExist);

}
