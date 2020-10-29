/*
 * Copyright (c) 2020 MarkLogic Corporation
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
    void isVersionCompatibleWith520Roles() {
        Map<String, Boolean> versionMap = Map.of(
                "9.0-20200909", false,
                "9.0-10.2", false,
                "10.0-20200909", true,
                "10.0-2.1", false,
                "10.0-3", true,
                "10.0-3.1", true,
                "11.0-10.2", true
        );
        versionMap.forEach((version, aBoolean) -> assertEquals(new MarkLogicVersion(version).isVersionCompatibleWith520Roles(), aBoolean, "Expected " + aBoolean + " for " + version));
    }

    @Test
    void supportsRangeIndexConstraints() {
        Map<String, Boolean> versionMap = Map.of(
                "9.0-20200909", false,
                "9.0-10.2", false,
                "10.0-20200909", true,
                "10.0-3.1", false,
                "10.0-4", true,
                "10.0-4.1", true,
                "11.0-10.2", true
        );
        versionMap.forEach((version, aBoolean) -> assertEquals(new MarkLogicVersion(version).supportsRangeIndexConstraints(), aBoolean, "Expected " + aBoolean + " for " + version));
    }

    @Test
    void supportsDataHubFramework() {
        Map<String, Boolean> versionMap = Map.of(
                "9.0-20200909", true,
                "9.0-10.2", false,
                "9.0-11", true,
                "9.0-11.1", true,
                "10.0-20200909", true,
                "10.0-2", false,
                "10.0-2.1", true,
                "10.0-4.1", true,
                "11.0-10.2", true
        );
        versionMap.forEach((version, aBoolean) -> assertEquals(new MarkLogicVersion(version).supportsDataHubFramework(), aBoolean, "Expected " + aBoolean + " for " + version));
    }

    @Test
    void cannotUpdateAmps() {
        Map<String, Boolean> versionMap = Map.of(
                "9.0-20200909", false,
                "9.0-10.2", false,
                "10.0-20200909", false,
                "10.0-2.1", false,
                "10.0-4.4", true,
                "11.0-10.2", false
        );
        versionMap.forEach((version, aBoolean) -> assertEquals(new MarkLogicVersion(version).cannotUpdateAmps(), aBoolean, "Expected " + aBoolean + " for " + version));
    }
}
