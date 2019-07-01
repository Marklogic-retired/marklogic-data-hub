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
package com.marklogic.hub.deploy.util;

import java.io.File;
import java.io.FileFilter;

/**
 * Simple implementation that accepts every file and ignores anything starting with ".".
 */
public class HubFileFilter implements FileFilter {

    @Override
    public boolean accept(File f) {
        boolean result = f != null &&
            !f.getName().startsWith(".") &&
            !f.getName().endsWith("entity.json") &&
            !f.getName().endsWith("mapping.json") &&
            !f.getName().endsWith("flow.json") &&
            !f.getName().endsWith("step.json") &&
            !f.getName().equals(f.getParentFile().getName() + ".properties") &&
            !f.toString().matches(".*[/\\\\]REST[/\\\\].*") &&

            // ignore vim files ending in ~
            !f.getName().endsWith("~");
        return result;
    }

}
