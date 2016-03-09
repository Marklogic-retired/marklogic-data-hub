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
package com.marklogic.hub.flow;

import org.w3c.dom.Element;

import com.marklogic.client.io.Format;
import com.marklogic.hub.FlowComplexity;
import com.marklogic.hub.plugin.Plugin;
import com.marklogic.hub.plugin.ServerPlugin;

/**
 * A class for representing a simple Flow
 *
 */
public class SimpleFlow extends AbstractFlow {

    public SimpleFlow(String entityName, String flowName, FlowType type,
            Format dataFormat) {
        super(entityName, flowName, type, dataFormat, FlowComplexity.SIMPLE);
        for (int i = 0; i < 3; i++) {
            super.addPlugin(null);
        }
    }

    public SimpleFlow(Element xml) {
        super(xml);
    }

    /**
     * Returns the header plugin used by this flow
     */
    public Plugin getHeaderPlugin() {
        return this.plugins.get(1);
    }

    /**
     * Sets the header plugin to use
     * @param plugin
     */
    public void setHeaderPlugin(ServerPlugin plugin) {
        this.plugins.set(1, plugin);
    }

    public Plugin getContentPlugin() {
        return this.plugins.get(0);
    }

    public void setContentPlugin(ServerPlugin plugin) {
        this.plugins.set(0, plugin);
    }

    public Plugin getTriplesPlugin() {
        return this.plugins.get(2);
    }

    public void setTriplesPlugin(ServerPlugin plugin) {
        this.plugins.set(2, plugin);
    }

    @Override
    public void addPlugin(Plugin plugin) {
        throw new UnsupportedOperationException("Use setHeaderPlugin, setTriplesPlugin, ...");
    }
}
