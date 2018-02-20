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

import com.marklogic.hub.InstallInfo;

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
            isStagingAppServerExists() ||
                isFinalAppServerExists() ||
                isTraceAppServerExists() ||
                isJobAppServerExists() ||
                isStagingDbExists() ||
                isStagingTripleIndexOn() ||
                isStagingCollectionLexiconOn() ||
                isFinalDbExists() ||
                isFinalTripleIndexOn() ||
                isFinalCollectionLexiconOn() ||
                isTraceDbExists() ||
                isJobDbExists() ||
                isStagingForestsExist() ||
                isFinalForestsExist() ||
                isTraceForestsExist() ||
                isJobForestsExist()
        );
    }

    @Override public boolean isInstalled() {
        boolean appserversOk = (
            isStagingAppServerExists() &&
                isFinalAppServerExists() &&
                isTraceAppServerExists() &&
                isJobAppServerExists()
        );

        boolean dbsOk = (
            isStagingDbExists() &&
                isStagingTripleIndexOn() &&
                isStagingCollectionLexiconOn() &&
                isFinalDbExists() &&
                isFinalTripleIndexOn() &&
                isFinalCollectionLexiconOn() &&
                isTraceDbExists() &&
                isJobDbExists()
        );
        boolean forestsOk = (
            isStagingForestsExist() &&
                isFinalForestsExist() &&
                isTraceForestsExist() &&
                isJobForestsExist()
        );

        return (appserversOk && dbsOk && forestsOk);
    }

    @Override public String toString() {
        return "\n" +
        "Checking MarkLogic Installation:\n" +
        "\tAppServers:\n" +
        "\t\tStaging: " + (isStagingAppServerExists() ? "exists" : "MISSING") + "\n" +
        "\t\tFinal:   " + (isFinalAppServerExists() ? "exists" : "MISSING") + "\n" +
        "\t\tTrace:   " + (isTraceAppServerExists() ? "exists" : "MISSING") + "\n" +
        "\t\tJob:     " + (isJobAppServerExists() ? "exists" : "MISSING") + "\n" +
        "\tDatabases:\n" +
        "\t\tStaging: " + (isStagingDbExists() ? "exists" : "MISSING") + "\n" +
        "\t\tFinal:   " + (isFinalDbExists() ? "exists" : "MISSING") + "\n" +
        "\t\tTrace:   " + (isTraceDbExists() ? "exists" : "MISSING") + "\n" +
        "\t\tJob:     " + (isJobDbExists() ? "exists" : "MISSING") + "\n" +
        "\tDatabases Indexes:\n" +
        "\t\tStaging Triples Index : " + (isStagingTripleIndexOn() ? "exists" : "MISSING") + "\n" +
        "\t\tStaging Collection Lexicon : " + (isStagingCollectionLexiconOn() ? "exists" : "MISSING") + "\n" +
        "\t\tFinal Triples Index : " + (isFinalTripleIndexOn() ? "exists" : "MISSING") + "\n" +
        "\t\tFinal Collection Lexicon : " + (isFinalCollectionLexiconOn() ? "exists" : "MISSING") + "\n" +
        "\tForests\n" +
        "\t\tStaging: " + (isStagingForestsExist() ? "exists" : "MISSING") + "\n" +
        "\t\tFinal:   " + (isFinalForestsExist() ? "exists" : "MISSING") + "\n" +
        "\t\tTrace:   " + (isTraceForestsExist() ? "exists" : "MISSING") + "\n" +
        "\t\tJob:     " + (isJobForestsExist() ? "exists" : "MISSING") + "\n" +
        "\n\n" +
        "OVERAL RESULT: " + (isInstalled() ? "INSTALLED" : "NOT INSTALLED") + "\n";
    }

    @Override public boolean isStagingAppServerExists() {
        return stagingAppServerExists;
    }

    @Override public void setStagingAppServerExists(boolean stagingAppServerExists) {
        this.stagingAppServerExists = stagingAppServerExists;
    }

    @Override public boolean isFinalAppServerExists() {
        return finalAppServerExists;
    }

    @Override public void setFinalAppServerExists(boolean finalAppServerExists) {
        this.finalAppServerExists = finalAppServerExists;
    }

    @Override public boolean isTraceAppServerExists() {
        return traceAppServerExists;
    }

    @Override public void setTraceAppServerExists(boolean traceAppServerExists) {
        this.traceAppServerExists = traceAppServerExists;
    }

    @Override public boolean isJobAppServerExists() {
        return jobAppServerExists;
    }

    @Override public void setJobAppServerExists(boolean jobAppServerExists) {
        this.jobAppServerExists = jobAppServerExists;
    }

    @Override public boolean isStagingDbExists() {
        return stagingDbExists;
    }

    @Override public void setStagingDbExists(boolean stagingDbExists) {
        this.stagingDbExists = stagingDbExists;
    }

    @Override public boolean isFinalDbExists() {
        return finalDbExists;
    }

    @Override public void setFinalDbExists(boolean finalDbExists) {
        this.finalDbExists = finalDbExists;
    }

    @Override public boolean isTraceDbExists() {
        return traceDbExists;
    }

    @Override public void setTraceDbExists(boolean traceDbExists) {
        this.traceDbExists = traceDbExists;
    }

    @Override public boolean isJobDbExists() {
        return jobDbExists;
    }

    @Override public void setJobDbExists(boolean jobDbExists) {
        this.jobDbExists = jobDbExists;
    }

    @Override public boolean isStagingTripleIndexOn() {
        return stagingTripleIndexOn;
    }

    @Override public void setStagingTripleIndexOn(boolean stagingTripleIndexOn) {
        this.stagingTripleIndexOn = stagingTripleIndexOn;
    }

    @Override public boolean isStagingCollectionLexiconOn() {
        return stagingCollectionLexiconOn;
    }

    @Override public void setStagingCollectionLexiconOn(boolean stagingCollectionLexiconOn) {
        this.stagingCollectionLexiconOn = stagingCollectionLexiconOn;
    }

    @Override public boolean isFinalTripleIndexOn() {
        return finalTripleIndexOn;
    }

    @Override public void setFinalTripleIndexOn(boolean finalTripleIndexOn) {
        this.finalTripleIndexOn = finalTripleIndexOn;
    }

    @Override public boolean isFinalCollectionLexiconOn() {
        return finalCollectionLexiconOn;
    }

    @Override public void setFinalCollectionLexiconOn(boolean finalCollectionLexiconOn) {
        this.finalCollectionLexiconOn = finalCollectionLexiconOn;
    }

    @Override public boolean isStagingForestsExist() {
        return stagingForestsExist;
    }

    @Override public void setStagingForestsExist(boolean stagingForestsExist) {
        this.stagingForestsExist = stagingForestsExist;
    }

    @Override public boolean isFinalForestsExist() {
        return finalForestsExist;
    }

    @Override public void setFinalForestsExist(boolean finalForestsExist) {
        this.finalForestsExist = finalForestsExist;
    }

    @Override public boolean isTraceForestsExist() {
        return traceForestsExist;
    }

    @Override public void setTraceForestsExist(boolean traceForestsExist) {
        this.traceForestsExist = traceForestsExist;
    }

    @Override public boolean isJobForestsExist() {
        return jobForestsExist;
    }

    @Override public void setJobForestsExist(boolean jobForestsExist) {
        this.jobForestsExist = jobForestsExist;
    }
}
