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
package com.marklogic.hub.oneui.managers;

import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MapSearchableManager {

    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    protected StructuredQueryDefinition addRangeConstraint(StructuredQueryBuilder sb, String name, String value) {
        StructuredQueryDefinition sqd = null;
        if (value != null && !value.isEmpty()) {
            sqd = sb.rangeConstraint(name, StructuredQueryBuilder.Operator.EQ, value);
        }
        return sqd;
    }

}
