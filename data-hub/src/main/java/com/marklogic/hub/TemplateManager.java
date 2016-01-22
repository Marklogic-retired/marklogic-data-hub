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

import java.util.List;

import com.marklogic.client.io.marker.AbstractReadHandle;
import com.marklogic.hub.template.Template;

public class TemplateManager {
    List<Template> getTemplates() {
        return null;
    }

    void installTemplate(Template template) {

    }

    void uninstallTemplate(String templateName) {

    }

    // allows it to run against XML, JSON, txt, ...
    <R extends AbstractReadHandle> R runTemplate(Template template) {
        return null;
    }

}
