package com.marklogic.hub;

import com.marklogic.hub.impl.InstallInfoImpl;

public interface InstallInfo {

    static InstallInfo create() {
        return new InstallInfoImpl();
    }

    boolean isPartiallyInstalled();

    boolean isInstalled();

    String toString();

    boolean isStagingAppServerExists();

    void setStagingAppServerExists(boolean stagingAppServerExists);

    boolean isFinalAppServerExists();

    void setFinalAppServerExists(boolean finalAppServerExists);

    boolean isTraceAppServerExists();

    void setTraceAppServerExists(boolean traceAppServerExists);

    boolean isJobAppServerExists();

    void setJobAppServerExists(boolean jobAppServerExists);

    boolean isStagingDbExists();

    void setStagingDbExists(boolean stagingDbExists);

    boolean isFinalDbExists();

    void setFinalDbExists(boolean finalDbExists);

    boolean isTraceDbExists();

    void setTraceDbExists(boolean traceDbExists);

    boolean isJobDbExists();

    void setJobDbExists(boolean jobDbExists);

    boolean isStagingTripleIndexOn();

    void setStagingTripleIndexOn(boolean stagingTripleIndexOn);

    boolean isStagingCollectionLexiconOn();

    void setStagingCollectionLexiconOn(boolean stagingCollectionLexiconOn);

    boolean isFinalTripleIndexOn();

    void setFinalTripleIndexOn(boolean finalTripleIndexOn);

    boolean isFinalCollectionLexiconOn();

    void setFinalCollectionLexiconOn(boolean finalCollectionLexiconOn);

    boolean isStagingForestsExist();

    void setStagingForestsExist(boolean stagingForestsExist);

    boolean isFinalForestsExist();

    void setFinalForestsExist(boolean finalForestsExist);

    boolean isTraceForestsExist();

    void setTraceForestsExist(boolean traceForestsExist);

    boolean isJobForestsExist();

    void setJobForestsExist(boolean jobForestsExist);
}
