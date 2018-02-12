/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.hub.scaffold;

import com.marklogic.appdeployer.command.modules.AllButAssetsModulesFinder;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.HashMap;
import java.util.List;

public class ScaffoldingValidator extends SimpleFileVisitor<Path> {

    private static String UNIQUE_KEY = "unique";
   private Path pluginsDir;

   public ScaffoldingValidator(String projectDir) {
       this.pluginsDir = Paths.get(projectDir, "plugins");
   }

   public boolean isUniqueRestServiceExtension(String name) {
       HashMap<String, Boolean> result = new HashMap<>();
       result.put(UNIQUE_KEY, true);
       try {
           Files.walkFileTree(pluginsDir.resolve("entities"), new SimpleFileVisitor<Path>() {
               @Override
               public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                   if (isRestDir(dir)) {
                       AllButAssetsModulesFinder modulesFinder = new AllButAssetsModulesFinder();
                       List<Resource> services = modulesFinder.findModules(dir.toString()).getServices();
                       for (int i = 0; i < services.size(); i++) {
                           Resource resource = services.get(i);
                           if (resource.getFilename().matches(name + "\\.(sjs|xqy)")) {
                               result.put(UNIQUE_KEY, false);
                               return FileVisitResult.TERMINATE;
                           }
                       }
                       return FileVisitResult.SKIP_SUBTREE;
                   }

                   return FileVisitResult.CONTINUE;
               }
           });
       } catch (IOException e) {

       }
       return result.get(UNIQUE_KEY);
   }

   public boolean isUniqueRestTransform(String name) {
       HashMap<String, Boolean> result = new HashMap<>();
       result.put(UNIQUE_KEY, true);
       try {
           Files.walkFileTree(pluginsDir.resolve("entities"), new SimpleFileVisitor<Path>() {
               @Override
               public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
                   if (isRestDir(dir)) {
                       AllButAssetsModulesFinder modulesFinder = new AllButAssetsModulesFinder();
                       List<Resource> transforms = modulesFinder.findModules(dir.toString()).getTransforms();
                       for (int i = 0; i < transforms.size(); i++) {
                           Resource resource = transforms.get(i);
                           if (resource.getFilename().matches(name + "\\.(sjs|xqy)")) {
                               result.put(UNIQUE_KEY, false);
                               return FileVisitResult.TERMINATE;
                           }
                       }
                       return FileVisitResult.SKIP_SUBTREE;
                   }

                   return FileVisitResult.CONTINUE;
               }
           });
       } catch (IOException e) {

       }
       return result.get(UNIQUE_KEY);
   }

   boolean isRestDir(Path dir) {
       return dir.endsWith("REST");
   }
}
