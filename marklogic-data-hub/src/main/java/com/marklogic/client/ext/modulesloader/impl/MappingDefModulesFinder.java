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
package com.marklogic.client.ext.modulesloader.impl;

import com.marklogic.client.ext.modulesloader.Modules;

public class MappingDefModulesFinder extends BaseModulesFinder {

    @Override
    protected Modules findModulesWithResolvedBaseDir(String baseDir) {
        Modules modules = new Modules();
        modules.setAssets(findResources("Mapping Def", baseDir, "*.mapping.json"));
        return modules;
    }
}
