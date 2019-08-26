/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
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
