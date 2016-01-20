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
package com.marklogic.hub;

import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

@JsonInclude(Include.NON_NULL)
public class EnvelopeOptions {
    public ArrayList<Namespace> namespaces = null;
    public ArrayList<Extractor> extractors = null;

    public void addNameSpace(Namespace namespace) {
        if (null == this.namespaces) {
            this.namespaces = new ArrayList<Namespace>();
        }
        this.namespaces.add(namespace);
    }

    public void addExtractor(Extractor extractor) {
        if (null == this.extractors) {
            this.extractors = new ArrayList<Extractor>();
        }
        this.extractors.add(extractor);
    }
}
