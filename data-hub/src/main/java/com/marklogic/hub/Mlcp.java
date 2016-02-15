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

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.hub.util.IOUtil;
import com.marklogic.hub.util.IOUtil.LogLevel;

public class Mlcp {
    private static final Logger LOGGER = LoggerFactory.getLogger(Mlcp.class);

    private List<MlcpSource> sources = new ArrayList<>();
    
    private String mlcpPath;
    
    public Mlcp(String mlcpPath) {
        this.mlcpPath = mlcpPath;
    }
    
    public void addSourceDirectory(String directoryPath, SourceOptions options) {
        MlcpSource source = new MlcpSource(directoryPath, options);
        sources.add(source);
    }
    
    public void loadContent() {
        for (MlcpSource source : sources) {
            Thread inputThread = null;
            Thread errorThread = null;
            try {
                List<String> arguments = new ArrayList<>();
                
                arguments.add(mlcpPath);
                arguments.add("import");
                arguments.add("-mode");
                arguments.add("local");
                arguments.add("-host");
                arguments.add("localhost");
                arguments.add("-port");
                arguments.add("8053");
                arguments.add("-username");
                arguments.add("admin");
                arguments.add("-password");
                arguments.add("admin");
                
                // add arguments related to the source
                List<String> sourceArguments = source.getMlcpArguments();
                arguments.addAll(sourceArguments);
                
                ProcessBuilder pb = new ProcessBuilder(arguments.toArray(new String[0]));
                Process process = pb.start();
                
                inputThread = IOUtil.createInputStreamSink(process.getInputStream(), LOGGER, LogLevel.DEBUG);
                errorThread = IOUtil.createInputStreamSink(process.getErrorStream(), LOGGER, LogLevel.ERROR);
                
                inputThread.start();
                errorThread.start();
                
                process.waitFor();
            }
            catch (Exception e) {
                LOGGER.error("Failed to load {}", source.getSourcePath(), e);
            }
            finally {
                if (inputThread != null) {
                    inputThread.interrupt();
                }
                if (errorThread != null) {
                    errorThread.interrupt();
                }
            }
        }
    }
    
    private static class MlcpSource {
        private String sourcePath;
        private SourceOptions sourceOptions;
        
        public MlcpSource(String sourcePath, SourceOptions sourceOptions) {
            this.sourcePath = sourcePath;
            this.sourceOptions = sourceOptions;
        }
        
        public String getSourcePath() {
            return sourcePath;
        }
        
        public List<String> getMlcpArguments() throws IOException {
            File file = new File(sourcePath);
            String canonicalPath = file.getCanonicalPath();
            
            List<String> arguments = new ArrayList<>();
            arguments.add("-input_file_path");
            arguments.add(canonicalPath);
            arguments.add("-input_file_type");
            if (sourceOptions.getInputFileType() == null) {
                arguments.add("documents");
            }
            else {
                arguments.add(sourceOptions.getInputFileType());
            }
            
            if (sourceOptions.getInputFilePattern() != null) {
                arguments.add("-input_file_pattern");
                arguments.add(sourceOptions.getInputFilePattern());
            }
            
            // by default, cut the source directory path to make URIs shorter
            String uriReplace = "/" + canonicalPath + ",''";
            uriReplace = uriReplace.replaceAll("\\\\", "/");
            
            arguments.add("-output_uri_replace");
            arguments.add(uriReplace);
            
            arguments.add("-transform_module");
            arguments.add("/com.marklogic.hub/mlcp-flow-transform.xqy");
            arguments.add("-transform_namespace");
            arguments.add("http://marklogic.com/hub-in-a-box/mlcp-flow-transform");
            arguments.add("-transform_param");
            arguments.add("\"" + sourceOptions.getTransformParams() + "\"");
            
            return arguments;
        }
    }
    
    public static class SourceOptions {
        private String domainName;
        private String flowName;
        private String flowType;
        private String inputFileType;
        private String inputFilePattern;
        
        public SourceOptions(String domainName, String flowName, String flowType) {
            this.domainName = domainName;
            this.flowName = flowName;
            this.flowType = flowType;
        }
        
        public String getDomainName() {
            return domainName;
        }
        
        public String getFlowName() {
            return flowName;
        }
        
        public String getFlowType() {
            return flowType;
        }
        
        public String getInputFileType() {
            return inputFileType;
        }
        
        public void setInputFileType(String inputFileType) {
            this.inputFileType = inputFileType;
        }
        
        public String getInputFilePattern() {
            return inputFilePattern;
        }
        
        public void setInputFilePattern(String inputFilePattern) {
            this.inputFilePattern = inputFilePattern;
        }
        
        protected String getTransformParams() {
            return String.format("<params><domain-name>%s</domain-name><flow-name>%s</flow-name><flow-type>%s</flow-type></params>", domainName, flowName, flowType);
        }
    }
}
