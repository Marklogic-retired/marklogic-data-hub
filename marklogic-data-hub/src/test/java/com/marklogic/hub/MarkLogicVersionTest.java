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
package com.marklogic.hub;

import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class MarkLogicVersionTest {

    @Test
    void nightly9() {
        MarkLogicVersion version = new MarkLogicVersion("9.0-20200909");
        assertTrue(version.isNightly());
        assertEquals("2020-09-09", version.getDateString());
        assertEquals(9, version.getMajor());
    }

    @Test
    void nightly10() {
        MarkLogicVersion version = new MarkLogicVersion("10.0-20200909");
        assertTrue(version.isNightly());
        assertEquals("2020-09-09", version.getDateString());
        assertEquals(10, version.getMajor());
    }

    @Test
    void nightly11() {
        MarkLogicVersion version = new MarkLogicVersion("11.0.20220909");
        assertTrue(version.isNightly());
        assertEquals("2022-09-09", version.getDateString());
        assertEquals(11, version.getMajor());

        // Linux Nightly Version
        version = new MarkLogicVersion("11.0.20220909-1");
        assertTrue(version.isNightly());
        assertEquals("2022-09-09", version.getDateString());
        assertEquals(11, version.getMajor());
    }

    @Test
    void supportsDataHubFramework() {
        Map<String, Boolean> versionMap = new HashMap<>();
        versionMap.put("9.0-20200909", false);
        versionMap.put("9.0-10.2", false);
        versionMap.put("9.0-11", false);
        versionMap.put("9.0-11.1", false);
        versionMap.put("10.0-20200909", true);
        versionMap.put("10.0-2", false);
        versionMap.put("10.0-2.1", false);
        versionMap.put("10.0-4.1", false);
        versionMap.put("11.0.0", true);
        versionMap.put("11.0.5", true);
        versionMap.put("11.1.2", true);
        versionMap.forEach((version, aBoolean) -> assertEquals(new MarkLogicVersion(version).supportsDataHubFramework(), aBoolean, "Expected " + aBoolean + " for " + version));
    }
}
