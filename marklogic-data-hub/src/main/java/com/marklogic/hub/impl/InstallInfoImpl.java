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
package com.marklogic.hub.impl;

import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.InstallInfo;
import com.marklogic.hub.error.InvalidDBOperationError;

public class InstallInfoImpl implements InstallInfo {
    private boolean stagingAppServerExists = false;
    private boolean finalAppServerExists = false;
    private boolean traceAppServerExists = false;
    private boolean jobAppServerExists = false;

    private boolean stagingDbExists = false;
    private boolean finalDbExists = false;
    private boolean traceDbExists = false;
    private boolean jobDbExists = false;

    private boolean stagingTripleIndexOn = false;
    private boolean stagingCollectionLexiconOn = false;
    private boolean finalTripleIndexOn = false;
    private boolean finalCollectionLexiconOn = false;

    private boolean stagingForestsExist = false;
    private boolean finalForestsExist = false;
    private boolean traceForestsExist = false;
    private boolean jobForestsExist = false;

    @Override public boolean isPartiallyInstalled() {
        return (
            isAppServerExistent(DatabaseKind.STAGING) ||
                isAppServerExistent(DatabaseKind.FINAL) ||
                isAppServerExistent(DatabaseKind.TRACE) ||
                isAppServerExistent(DatabaseKind.JOB) ||
                isDbExistent(DatabaseKind.STAGING) ||
                isTripleIndexOn(DatabaseKind.STAGING) ||
                isCollectionLexiconOn(DatabaseKind.STAGING) ||
                isDbExistent(DatabaseKind.FINAL) ||
                isTripleIndexOn(DatabaseKind.FINAL) ||
                isCollectionLexiconOn(DatabaseKind.FINAL) ||
                isDbExistent(DatabaseKind.TRACE) ||
                isDbExistent(DatabaseKind.JOB) ||
                areForestsExistent(DatabaseKind.STAGING) ||
                areForestsExistent(DatabaseKind.FINAL) ||
                areForestsExistent(DatabaseKind.TRACE) ||
                areForestsExistent(DatabaseKind.JOB)
        );
    }

    @Override public boolean isInstalled() {
        boolean appserversOk = (
            isAppServerExistent(DatabaseKind.STAGING) &&
                isAppServerExistent(DatabaseKind.FINAL) &&
                isAppServerExistent(DatabaseKind.TRACE) &&
                isAppServerExistent(DatabaseKind.JOB)
        );

        boolean dbsOk = (
            isDbExistent(DatabaseKind.STAGING) &&
                isTripleIndexOn(DatabaseKind.STAGING) &&
                isCollectionLexiconOn(DatabaseKind.STAGING) &&
                isDbExistent(DatabaseKind.FINAL) &&
                isTripleIndexOn(DatabaseKind.FINAL) &&
                isCollectionLexiconOn(DatabaseKind.FINAL) &&
                isDbExistent(DatabaseKind.TRACE) &&
                isDbExistent(DatabaseKind.JOB)
        );
        boolean forestsOk = (
            areForestsExistent(DatabaseKind.STAGING) &&
                areForestsExistent(DatabaseKind.FINAL) &&
                areForestsExistent(DatabaseKind.TRACE) &&
                areForestsExistent(DatabaseKind.JOB)
        );

        return (appserversOk && dbsOk && forestsOk);
    }

    @Override public String toString() {
        return "\n" +
            "Checking MarkLogic Installation:\n" +
            "\tAppServers:\n" +
            "\t\tStaging: " + (isAppServerExistent(DatabaseKind.STAGING) ? "exists" : "MISSING") + "\n" +
            "\t\tFinal:   " + (isAppServerExistent(DatabaseKind.FINAL) ? "exists" : "MISSING") + "\n" +
            "\t\tTrace:   " + (isAppServerExistent(DatabaseKind.TRACE) ? "exists" : "MISSING") + "\n" +
            "\t\tJob:     " + (isAppServerExistent(DatabaseKind.JOB) ? "exists" : "MISSING") + "\n" +
            "\tDatabases:\n" +
            "\t\tStaging: " + (isDbExistent(DatabaseKind.STAGING) ? "exists" : "MISSING") + "\n" +
            "\t\tFinal:   " + (isDbExistent(DatabaseKind.FINAL) ? "exists" : "MISSING") + "\n" +
            "\t\tTrace:   " + (isDbExistent(DatabaseKind.TRACE) ? "exists" : "MISSING") + "\n" +
            "\t\tJob:     " + (isDbExistent(DatabaseKind.JOB) ? "exists" : "MISSING") + "\n" +
            "\tDatabases Indexes:\n" +
            "\t\tStaging Triples Index : " + (isTripleIndexOn(DatabaseKind.STAGING) ? "exists" : "MISSING") + "\n" +
            "\t\tStaging Collection Lexicon : " + (isCollectionLexiconOn(DatabaseKind.STAGING) ? "exists" : "MISSING") + "\n" +
            "\t\tFinal Triples Index : " + (isTripleIndexOn(DatabaseKind.FINAL) ? "exists" : "MISSING") + "\n" +
            "\t\tFinal Collection Lexicon : " + (isCollectionLexiconOn(DatabaseKind.FINAL) ? "exists" : "MISSING") + "\n" +
            "\tForests\n" +
            "\t\tStaging: " + (areForestsExistent(DatabaseKind.STAGING) ? "exists" : "MISSING") + "\n" +
            "\t\tFinal:   " + (areForestsExistent(DatabaseKind.FINAL) ? "exists" : "MISSING") + "\n" +
            "\t\tTrace:   " + (areForestsExistent(DatabaseKind.TRACE) ? "exists" : "MISSING") + "\n" +
            "\t\tJob:     " + (areForestsExistent(DatabaseKind.JOB) ? "exists" : "MISSING") + "\n" +
            "\n\n" +
            "OVERAL RESULT: " + (isInstalled() ? "INSTALLED" : "NOT INSTALLED") + "\n";
    }

    @Override public boolean isAppServerExistent(DatabaseKind kind) {
        boolean exists = false;
        switch (kind) {
            case STAGING:
                exists = stagingAppServerExists;
                break;
            case FINAL:
                exists = finalAppServerExists;
                break;
            case JOB:
                exists = jobAppServerExists;
                break;
            case TRACE:
                exists = traceAppServerExists;
                break;
            default:
                throw new InvalidDBOperationError(kind, "test appserver existence");
        }
        return exists;
    }

    @Override public void setAppServerExistent(DatabaseKind kind, boolean exists) {
        switch (kind) {
            case STAGING:
                this.stagingAppServerExists = exists;
                break;
            case FINAL:
                this.finalAppServerExists = exists;
                break;
            case TRACE:
                this.traceAppServerExists = exists;
                break;
            case JOB:
                this.jobAppServerExists = exists;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set the triple index");
        }
    }

    @Override public boolean isDbExistent(DatabaseKind kind) {
        boolean exists = false;
        switch (kind) {
            case STAGING:
                exists = stagingDbExists;
                break;
            case FINAL:
                exists = finalDbExists;
                break;
            case JOB:
                exists = jobDbExists;
                break;
            case TRACE:
                exists = traceDbExists;
                break;
            default:
                throw new InvalidDBOperationError(kind, "test database existence");
        }
        return exists;
    }

    @Override public void setDbExistent(DatabaseKind kind, boolean exists) {
        switch (kind) {
            case STAGING:
                this.stagingDbExists = exists;
                break;
            case FINAL:
                this.finalDbExists = exists;
                break;
            case TRACE:
                this.traceDbExists = exists;
                break;
            case JOB:
                this.jobDbExists = exists;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set the triple index");
        }
    }


    @Override public boolean isTripleIndexOn(DatabaseKind kind) {
        boolean on = false;
        switch (kind) {
            case STAGING:
                on = stagingTripleIndexOn;
                break;
            case FINAL:
                on = finalTripleIndexOn;
                break;
            default:
                throw new InvalidDBOperationError(kind, "check the triple index");
        }
        return on;
    }

    @Override public void setTripleIndexOn(DatabaseKind kind, boolean tripleIndexOn) {
        switch (kind) {
            case STAGING:
                this.stagingTripleIndexOn = tripleIndexOn;
                break;
            case FINAL:
                this.finalTripleIndexOn = tripleIndexOn;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set the triple index");
        }
    }

    @Override public boolean isCollectionLexiconOn(DatabaseKind kind) {
        boolean on = false;
        switch (kind) {
            case STAGING:
                on = stagingCollectionLexiconOn;
                break;
            case FINAL:
                on = finalCollectionLexiconOn;
                break;
            default:
                throw new InvalidDBOperationError(kind, "check the collection lexicon");
        }
        return on;
    }

    @Override public void setCollectionLexiconOn(DatabaseKind kind, boolean collectionLexiconOn) {
        switch (kind) {
            case STAGING:
                this.stagingCollectionLexiconOn = collectionLexiconOn;
                break;
            case FINAL:
                this.finalCollectionLexiconOn = collectionLexiconOn;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set the collection lexicon");
        }
    }

    @Override public boolean areForestsExistent(DatabaseKind kind) {
        boolean exists = false;
        switch (kind) {
            case STAGING:
                exists = stagingForestsExist;
                break;
            case FINAL:
                exists = finalForestsExist;
                break;
            case TRACE:
                exists = traceForestsExist;
                break;
            case JOB:
                exists = jobForestsExist;
                break;
            default:
                throw new InvalidDBOperationError(kind, "check forest existence");
        }
        return exists;
    }

    @Override public void setForestsExistent(DatabaseKind kind, boolean forestsExistent) {
        switch (kind) {
            case STAGING:
                this.stagingForestsExist = forestsExistent;
                break;
            case FINAL:
                this.finalForestsExist = forestsExistent;
                break;
            case TRACE:
                this.traceForestsExist = forestsExistent;
                break;
            case JOB:
                this.jobForestsExist = forestsExistent;
                break;
            default:
                throw new InvalidDBOperationError(kind, "set forest existence");
        }
    }
}
