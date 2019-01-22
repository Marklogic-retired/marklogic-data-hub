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

import com.marklogic.hub.error.InvalidDBOperationError;

/**
 * Public enumeration for the types of databases in MarkLogic that the
 * DHF uses. databaseNames are the string representations of types.
 *
 * Throws an error if an invalid DatabaseKind is specified.
 */
public enum DatabaseKind {
        STAGING,
        FINAL,
        JOB,
        @Deprecated TRACE,
        STAGING_SCHEMAS,
        FINAL_SCHEMAS,
        STAGING_TRIGGERS,
        FINAL_TRIGGERS,
        MODULES,
        @Deprecated STAGING_MODULES,
        @Deprecated FINAL_MODULES;

       static private String[] databaseNames = {
           "staging",
           "final",
           "jobs",
           "jobs",
           "staging_schemas",
           "final_schemas",
           "staging_triggers",
           "final_triggers",
           "modules",
           "modules",
           "modules"
        };

     /**
     * Validates the MarkLogic server to ensure compatibility with the hub
     * @param databaseKind - the enum for the type of database
     * @return string name of the database kind
     * @throws InvalidDBOperationError if the database kind is not found in enumeration
     */
        static public String getName(DatabaseKind databaseKind){
            try {
                return databaseNames[databaseKind.ordinal()];
            } catch (Exception e) {
                throw new InvalidDBOperationError(databaseKind, "find databaseKind name");
            }
        }
}
