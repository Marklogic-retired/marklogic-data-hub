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

public class InstallInfo {
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

    public boolean isPartiallyInstalled() {
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

    public boolean isInstalled() {
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

    public String toString() {
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

    public boolean isStagingAppServerExists() {
        return stagingAppServerExists;
    }

    public void setStagingAppServerExists(boolean stagingAppServerExists) {
        this.stagingAppServerExists = stagingAppServerExists;
    }

    public boolean isFinalAppServerExists() {
        return finalAppServerExists;
    }

    public void setFinalAppServerExists(boolean finalAppServerExists) {
        this.finalAppServerExists = finalAppServerExists;
    }

    public boolean isTraceAppServerExists() {
        return traceAppServerExists;
    }

    public void setTraceAppServerExists(boolean traceAppServerExists) {
        this.traceAppServerExists = traceAppServerExists;
    }

    public boolean isJobAppServerExists() {
        return jobAppServerExists;
    }

    public void setJobAppServerExists(boolean jobAppServerExists) {
        this.jobAppServerExists = jobAppServerExists;
    }

    public boolean isStagingDbExists() {
        return stagingDbExists;
    }

    public void setStagingDbExists(boolean stagingDbExists) {
        this.stagingDbExists = stagingDbExists;
    }

    public boolean isFinalDbExists() {
        return finalDbExists;
    }

    public void setFinalDbExists(boolean finalDbExists) {
        this.finalDbExists = finalDbExists;
    }

    public boolean isTraceDbExists() {
        return traceDbExists;
    }

    public void setTraceDbExists(boolean traceDbExists) {
        this.traceDbExists = traceDbExists;
    }

    public boolean isJobDbExists() {
        return jobDbExists;
    }

    public void setJobDbExists(boolean jobDbExists) {
        this.jobDbExists = jobDbExists;
    }

    public boolean isStagingTripleIndexOn() {
        return stagingTripleIndexOn;
    }

    public void setStagingTripleIndexOn(boolean stagingTripleIndexOn) {
        this.stagingTripleIndexOn = stagingTripleIndexOn;
    }

    public boolean isStagingCollectionLexiconOn() {
        return stagingCollectionLexiconOn;
    }

    public void setStagingCollectionLexiconOn(boolean stagingCollectionLexiconOn) {
        this.stagingCollectionLexiconOn = stagingCollectionLexiconOn;
    }

    public boolean isFinalTripleIndexOn() {
        return finalTripleIndexOn;
    }

    public void setFinalTripleIndexOn(boolean finalTripleIndexOn) {
        this.finalTripleIndexOn = finalTripleIndexOn;
    }

    public boolean isFinalCollectionLexiconOn() {
        return finalCollectionLexiconOn;
    }

    public void setFinalCollectionLexiconOn(boolean finalCollectionLexiconOn) {
        this.finalCollectionLexiconOn = finalCollectionLexiconOn;
    }

    public boolean isStagingForestsExist() {
        return stagingForestsExist;
    }

    public void setStagingForestsExist(boolean stagingForestsExist) {
        this.stagingForestsExist = stagingForestsExist;
    }

    public boolean isFinalForestsExist() {
        return finalForestsExist;
    }

    public void setFinalForestsExist(boolean finalForestsExist) {
        this.finalForestsExist = finalForestsExist;
    }

    public boolean isTraceForestsExist() {
        return traceForestsExist;
    }

    public void setTraceForestsExist(boolean traceForestsExist) {
        this.traceForestsExist = traceForestsExist;
    }

    public boolean isJobForestsExist() {
        return jobForestsExist;
    }

    public void setJobForestsExist(boolean jobForestsExist) {
        this.jobForestsExist = jobForestsExist;
    }
}
