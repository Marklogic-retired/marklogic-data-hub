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
