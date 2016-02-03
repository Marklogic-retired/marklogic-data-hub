/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub.domain;

import java.util.List;

import com.marklogic.hub.flow.Flow;

/**
 * A domain object. The data hub groups data by domains.
 */
public interface Domain {
    /**
     * Gets the Domain name
     * @return the domain name
     */
    String getName();

    /**
     * Serializes the Domain as an XML string
     * @return the serialized XML string
     */
    String serialize();

    /**
     * Returns all flows registered to the domain
     * @return a list of flows
     */
    List<Flow> getFlows();
}
