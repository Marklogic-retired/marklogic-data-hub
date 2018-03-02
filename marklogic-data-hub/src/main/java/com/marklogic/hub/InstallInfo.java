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

import com.marklogic.hub.impl.InstallInfoImpl;

public interface InstallInfo {

    static InstallInfo create() {
        return new InstallInfoImpl();
    }

    boolean isPartiallyInstalled();

    boolean isInstalled();

    String toString();

    boolean isAppServerExistent(DatabaseKind kind);

    void setAppServerExistent(DatabaseKind kind, boolean stagingAppServerExists);

    boolean isDbExistent(DatabaseKind kind);

    void setDbExistent(DatabaseKind kind, boolean stagingDbExists);

    boolean isTripleIndexOn(DatabaseKind kind);

    void setTripleIndexOn(DatabaseKind kind, boolean stagingTripleIndexOn);

    boolean isCollectionLexiconOn(DatabaseKind kind);

    void setCollectionLexiconOn(DatabaseKind kind, boolean stagingCollectionLexiconOn);

    boolean areForestsExistent(DatabaseKind kind);

    void setForestsExistent(DatabaseKind kind, boolean stagingForestsExist);

}
