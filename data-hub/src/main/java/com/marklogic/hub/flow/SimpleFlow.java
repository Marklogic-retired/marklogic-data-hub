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

import java.util.List;

import org.w3c.dom.Document;

import com.marklogic.hub.template.ContentTemplate;
import com.marklogic.hub.template.HeaderTemplate;
import com.marklogic.hub.template.RdfTemplate;
import com.marklogic.hub.template.Template;

/**
 * A class for representing a simple Flow
 *
 */
public class SimpleFlow extends AbstractFlow {

    public SimpleFlow(String name) {
        super(name, "simple");
        for (int i = 0; i < 3; i++) {
            super.addTemplate(null);
        }
    }

    public SimpleFlow(Document xml) {
        super(xml);
    }

    /**
     * Returns the header template used by this flow
     */
    public HeaderTemplate getHeaderTemplate() {
        return (HeaderTemplate)this.templates.get(1);
    }

    /**
     * Sets the header template to use
     * @param template
     */
    public void setHeaderTemplate(HeaderTemplate template) {
        this.templates.set(1, template);
    }

    public ContentTemplate getContentTemplate() {
        return (ContentTemplate)this.templates.get(0);
    }

    public void setContentTemplate(ContentTemplate template) {
        this.templates.set(0, template);
    }

    public RdfTemplate getRdfTemplate() {
        return (RdfTemplate)this.templates.get(2);
    }

    public void setRdfTemplate(RdfTemplate template) {
        this.templates.set(2, template);
    }

    @Override
    public void addTemplate(Template template) {
        throw new UnsupportedOperationException("Use setHeaderTemplate, setRdfTemplate, ...");
    }

    @Override
    public List<Template> geTemplates() {
        throw new UnsupportedOperationException("Use getHeaderTemplate, getRdfTemplate, ...");
    }
}
