package com.marklogic.hub.explorer.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentDescriptor;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TestService {

    //TODO: Only for Example. Remove the service ASAP

    @Autowired
    private DatabaseClientHolder databaseClientHolder;

    public DocumentDescriptor test() {
        DatabaseClient databaseClient = databaseClientHolder.getDatabaseClient();
        System.out.println("DB client ===> " + databaseClient);

        return databaseClient.newDocumentManager().exists("/entities/Admissions.entity.json");
    }
}
