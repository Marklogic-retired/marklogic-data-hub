package com.marklogic.hub;

import com.marklogic.hub.impl.EntityManagerImpl;

import java.util.HashMap;

public interface EntityManager {

    static EntityManager create(HubConfig hubConfig) {
       return new EntityManagerImpl(hubConfig);
    }

    boolean saveQueryOptions();

    HashMap<Enum, Boolean> deployQueryOptions();

    boolean saveDbIndexes();
}
