package com.marklogic.com.marklogic.client.ext.modulesloader.impl;

import com.marklogic.client.ext.modulesloader.Modules;
import com.marklogic.client.ext.modulesloader.ModulesFinder;
import com.marklogic.client.ext.modulesloader.impl.BaseModulesFinder;
import org.springframework.core.io.UrlResource;

import java.net.MalformedURLException;
import java.util.Arrays;

public class UserModulesFinder extends BaseModulesFinder implements ModulesFinder {

    @Override
    protected Modules findModulesWithResolvedBaseDir(String baseDir) {
        Modules modules = new Modules();
        try {
            modules.setAssetDirectories(Arrays.asList(new UrlResource(baseDir)));
        } catch (MalformedURLException e) {
            throw new RuntimeException(e);
        }
        return modules;
    }
}
