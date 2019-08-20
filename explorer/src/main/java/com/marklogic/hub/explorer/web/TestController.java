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
package com.marklogic.hub.explorer.web;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/datahub/v2/test")
@Scope(proxyMode = ScopedProxyMode.TARGET_CLASS, value = "session")
public class TestController {

    //TODO: Only for Example. Remove the controller ASAP

    @Autowired
    private DatabaseClientHolder databaseClientHolder;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getMappings() {
        DatabaseClient databaseClient = databaseClientHolder.getDatabaseClient();
        System.out.println("DB client ===> " + databaseClient);

        return new ResponseEntity<>(databaseClient.newDocumentManager().exists("/entities/Admissions.entity.json"), HttpStatus.OK);
    }
}
