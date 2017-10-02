package com.marklogic.com.marklogic.client.ext.modulesloader.impl;

import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.impl.BaseModulesFinder;

public class SearchOptionsFinder extends BaseModulesFinder {
    @Override
    protected Modules findModulesWithResolvedBaseDir(String baseDir) {
        Modules modules = new Modules();
        addOptions(modules, baseDir);
        return modules;
    }
}
