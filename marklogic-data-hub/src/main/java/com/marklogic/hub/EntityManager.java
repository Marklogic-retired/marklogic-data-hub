package com.marklogic.hub;

import com.marklogic.hub.impl.EntityManagerImpl;
import org.springframework.core.io.Resource;

import java.util.List;

public interface EntityManager {

    static EntityManager create(HubConfig hubConfig) {
       return new EntityManagerImpl(hubConfig);
    }

    boolean saveQueryOptions();

    List<Resource> deployQueryOptions();

    boolean saveDbIndexes();
}
