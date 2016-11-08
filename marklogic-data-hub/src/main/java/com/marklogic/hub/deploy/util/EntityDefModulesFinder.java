package com.marklogic.hub.deploy.util;

import com.marklogic.client.modulesloader.Modules;
import com.marklogic.client.modulesloader.impl.BaseModulesFinder;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

public class EntityDefModulesFinder  extends BaseModulesFinder {

    @Override
    public Modules findModules(File baseDir) {
        Modules modules = new Modules();
        addEntityDefs(modules, baseDir);
        return modules;
    }

    protected void addEntityDefs(Modules modules, File baseDir) {
        List<Resource> services = new ArrayList<>();
        if (baseDir.exists()) {
            for (File f : baseDir.listFiles()) {
                if (f.getName().endsWith("entity.json")) {
                    services.add(new FileSystemResource(f));
                }
            }
        }
        modules.setAssets(services);
    }
}
