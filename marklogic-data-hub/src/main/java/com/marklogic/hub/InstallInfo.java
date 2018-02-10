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
    public boolean stagingAppServerExists = false;
    public boolean finalAppServerExists = false;
    public boolean traceAppServerExists = false;
    public boolean jobAppServerExists = false;

    public boolean stagingDbExists = false;
    public boolean finalDbExists = false;
    public boolean traceDbExists = false;
    public boolean jobDbExists = false;

    public boolean stagingTripleIndexOn = false;
    public boolean stagingCollectionLexiconOn = false;
    public boolean finalTripleIndexOn = false;
    public boolean finalCollectionLexiconOn = false;

    public boolean stagingForestsExist = false;
    public boolean finalForestsExist = false;
    public boolean traceForestsExist = false;
    public boolean jobForestsExist = false;

    public boolean isPartiallyInstalled() {
        return (
            stagingAppServerExists ||
            finalAppServerExists ||
            traceAppServerExists ||
            jobAppServerExists ||
            stagingDbExists ||
            stagingTripleIndexOn ||
            stagingCollectionLexiconOn ||
            finalDbExists ||
            finalTripleIndexOn ||
            finalCollectionLexiconOn ||
            traceDbExists ||
            jobDbExists ||
            stagingForestsExist ||
            finalForestsExist ||
            traceForestsExist ||
            jobForestsExist
        );
    }

    public boolean isInstalled() {
        boolean appserversOk = (
            stagingAppServerExists &&
            finalAppServerExists &&
            traceAppServerExists &&
            jobAppServerExists
        );

        boolean dbsOk = (
            stagingDbExists &&
            stagingTripleIndexOn &&
            stagingCollectionLexiconOn &&
            finalDbExists &&
            finalTripleIndexOn &&
            finalCollectionLexiconOn &&
            traceDbExists &&
            jobDbExists
        );
        boolean forestsOk = (
            stagingForestsExist &&
            finalForestsExist &&
            traceForestsExist &&
            jobForestsExist
        );

        return (appserversOk && dbsOk && forestsOk);
    }

    public String toString() {
        return "\n" +
        "Checking MarkLogic Installation:\n" +
        "\tAppServers:\n" +
        "\t\tStaging: " + (stagingAppServerExists ? "exists" : "MISSING") + "\n" +
        "\t\tFinal:   " + (finalAppServerExists? "exists" : "MISSING") + "\n" +
        "\t\tTrace:   " + (traceAppServerExists? "exists" : "MISSING") + "\n" +
        "\t\tJob:     " + (jobAppServerExists? "exists" : "MISSING") + "\n" +
        "\tDatabases:\n" +
        "\t\tStaging: " + (stagingDbExists ? "exists" : "MISSING") + "\n" +
        "\t\tFinal:   " + (finalDbExists? "exists" : "MISSING") + "\n" +
        "\t\tTrace:   " + (traceDbExists ? "exists" : "MISSING") + "\n" +
        "\t\tJob:     " + (jobDbExists ? "exists" : "MISSING") + "\n" +
        "\tDatabases Indexes:\n" +
        "\t\tStaging Triples Index : " + (stagingTripleIndexOn ? "exists" : "MISSING") + "\n" +
        "\t\tStaging Collection Lexicon : " + (stagingCollectionLexiconOn ? "exists" : "MISSING") + "\n" +
        "\t\tFinal Triples Index : " + (finalTripleIndexOn ? "exists" : "MISSING") + "\n" +
        "\t\tFinal Collection Lexicon : " + (finalCollectionLexiconOn ? "exists" : "MISSING") + "\n" +
        "\tForests\n" +
        "\t\tStaging: " + (stagingForestsExist ? "exists" : "MISSING") + "\n" +
        "\t\tFinal:   " + (finalForestsExist ? "exists" : "MISSING") + "\n" +
        "\t\tTrace:   " + (traceForestsExist ? "exists" : "MISSING") + "\n" +
        "\t\tJob:     " + (jobForestsExist ? "exists" : "MISSING") + "\n" +
        "\n\n" +
        "OVERAL RESULT: " + (isInstalled() ? "INSTALLED" : "NOT INSTALLED") + "\n";
    }

}
