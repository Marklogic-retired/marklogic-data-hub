/*
 * Copyright 2012-2021 MarkLogic Corporation
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
package com.marklogic.hub.central.pendo;

import org.junit.jupiter.api.Test;
import org.springframework.core.env.*;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;


public class PendoKeyProviderTest {

    @Test
    void testIsPendoEnabled() {
        Stream.of("true", "TRUE")
                .forEach(s -> assertTrue(new PendoKeyProvider(getEnvironmentWithValue("hubPendoEnabled", s))
                        .isPendoEnabled(), "Pendo should be enabled for property: hubPendoEnabled with value: " + s));

        Stream.of("false", null, "", "foo")
                .forEach(s -> assertFalse(new PendoKeyProvider(getEnvironmentWithValue("hubPendoEnabled", s))
                        .isPendoEnabled(), "Pendo should be disabled for property: hubPendoEnabled with value: " + s));

        Stream.of("false", "true", "", "foo")
                .forEach(s -> assertFalse(new PendoKeyProvider(getEnvironmentWithValue("foo", s))
                        .isPendoEnabled(), "Pendo should be disabled when property: hubPendoEnabled is not present"));
    }

    private Environment getEnvironmentWithValue(String property, String value) {
        ConfigurableEnvironment environment = new StandardEnvironment();
        MutablePropertySources propertySources = environment.getPropertySources();
        Map<String, Object> pendoMap = new HashMap<>();
        pendoMap.put(property, value);
        propertySources.addFirst(new MapPropertySource("PENDO_MAP", pendoMap));

        return environment;
    }
}
