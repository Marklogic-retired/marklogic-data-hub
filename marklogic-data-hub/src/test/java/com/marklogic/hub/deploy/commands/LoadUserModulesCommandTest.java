/*
 * Copyright (c) 2021 MarkLogic Corporation
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
package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.Versions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class LoadUserModulesCommandTest extends AbstractHubCoreTest {

    @Autowired
    Versions versions;

    @BeforeEach
    public void setupEach() {
        installProjectInFolder("flow-runner-test");
    }

    @Test
    void testDecodingSpecialCharsInFilePathName() {
        runAsDataHubDeveloper();
        new LoadHubModulesCommand(getHubConfig()).execute(newCommandContext());
        try {
            URLDecoder testDecoder = new URLDecoder();
            String data = testDecoder.decode("testURI/data/%23Name", StandardCharsets.UTF_8.name());
            assertEquals(data,"testURI/data/#Name");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
