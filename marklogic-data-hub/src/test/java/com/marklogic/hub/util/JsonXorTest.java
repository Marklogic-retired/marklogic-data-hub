/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.util;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;

import java.io.InputStream;

public class JsonXorTest extends HubTestBase {
    @Test
    public void xor() throws Exception {
        InputStream original = JsonXorTest.class.getClassLoader().getResourceAsStream("xor/original.json");
        InputStream changed = JsonXorTest.class.getClassLoader().getResourceAsStream("xor/changed.json");

        String expected = getResource("xor/xored.json");
        ObjectNode actual = (ObjectNode)JsonXor.xor(original, changed);
        JSONAssert.assertEquals(expected.toString(), actual.toString(), true);
    }

    @Test
    public void xorNoDiff() throws Exception {
        InputStream original = JsonXorTest.class.getClassLoader().getResourceAsStream("xor/original.json");
        InputStream changed = JsonXorTest.class.getClassLoader().getResourceAsStream("xor/changed-no-diff.json");

        String expected = getResource("xor/xored-no-diff.json");
        String actual = JsonXor.xor(original, changed).toString();
        JSONAssert.assertEquals(expected, actual, true);
    }



}
