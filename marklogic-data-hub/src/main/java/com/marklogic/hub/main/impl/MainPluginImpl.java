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
package com.marklogic.hub.main.impl;

import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.main.MainPlugin;

public class MainPluginImpl implements MainPlugin {

    private String module;
    private CodeFormat codeFormat;

    public MainPluginImpl() {}

    public MainPluginImpl(String module, CodeFormat codeFormat) {
        this.module = module;
        this.codeFormat = codeFormat;
    }

    public void setModule(String module) {
        this.module = module;
    }

    @Override
    public String getModule() {
        return module;
    }

    public void setCodeFormat(CodeFormat codeFormat) {
        this.codeFormat = codeFormat;
    }

    @Override
    public CodeFormat getCodeFormat() {
        return codeFormat;
    }
}
