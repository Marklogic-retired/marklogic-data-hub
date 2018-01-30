package com.marklogic.com.marklogic.client.ext.modulesloader.impl;

import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.impl.BaseModulesFinder;

public class EntityDefModulesFinder extends BaseModulesFinder {

    @Override
    protected Modules findModulesWithResolvedBaseDir(String baseDir) {
        Modules modules = new Modules();
        modules.setAssets(findResources("Entity Def", baseDir, "*.entity.json"));
        return modules;
    }
}
