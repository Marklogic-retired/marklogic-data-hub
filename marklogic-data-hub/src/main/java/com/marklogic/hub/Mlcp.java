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
import java.util.Iterator;
import java.util.List;

import org.codehaus.jettison.json.JSONArray;
import org.codehaus.jettison.json.JSONException;
import org.codehaus.jettison.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.marklogic.client.io.Format;

public class Mlcp {
	private static final Logger LOGGER = LoggerFactory.getLogger(Mlcp.class);

	private final static String DEFAULT_HADOOP_HOME_DIR = "./hadoop/";

	private List<MlcpSource> sources = new ArrayList<>();

	private String host;

	private int port;

	private String user;

	private String password;

	public Mlcp(String host, int port, String user, String password) throws IOException {
		this.host = host;
		this.port = port;
		this.user = user;
		this.password = password;

		setHadoopHomeDir();
	}

	public void addSourceDirectory(String directoryPath, SourceOptions options) {
		MlcpSource source = new MlcpSource(directoryPath, options);
		sources.add(source);
	}

	public void loadContent() throws IOException, JSONException {
		for (MlcpSource source : sources) {
			try {
				List<String> arguments = new ArrayList<>();

				arguments.add("import");
				arguments.add("-mode");
				arguments.add("local");
				arguments.add("-host");
				arguments.add(host);
				arguments.add("-port");
				arguments.add(Integer.toString(port));
				arguments.add("-username");
				arguments.add(user);
				arguments.add("-password");
				arguments.add(password);

				// add arguments related to the source
				List<String> sourceArguments = source.getMlcpArguments();
				arguments.addAll(sourceArguments);

				LOGGER.info(arguments.toString());
				DataHubContentPump contentPump = new DataHubContentPump(arguments);
				contentPump.execute();
			} catch (IOException e) {
				throw new IOException(
						"Cannot load data from: " + source.getSourcePath() + " due to: " + e.getMessage());
			}
		}
	}

	protected void setHadoopHomeDir() throws IOException {
		String home = System.getProperty("hadoop.home.dir");
		if (home == null) {
			home = DEFAULT_HADOOP_HOME_DIR;
		}
		System.setProperty("hadoop.home.dir", new File(home).getCanonicalPath());
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

		public List<String> getMlcpArguments() throws IOException, JSONException {
			File file = new File(sourcePath);
			String canonicalPath = file.getCanonicalPath();

			List<String> arguments = new ArrayList<>();
			arguments.add("-generate_uri");
			arguments.add("true");

			arguments.add("-input_file_path");
			arguments.add(canonicalPath);
//			arguments.add("-input_file_type");
//			if (sourceOptions.getInputFileType() == null) {
//				arguments.add("documents");
//			} else {
//				arguments.add(sourceOptions.getInputFileType());
//			}

//			String collections = this.getOutputCollections();
//			arguments.add("-output_collections");
//			arguments.add("\"" + collections + "\"");
//
//			if (sourceOptions.getInputCompressed()) {
//				arguments.add("-input_compressed");
//			}

			// by default, cut the source directory path to make URIs shorter
//			String uriReplace = canonicalPath + ",''";
//			uriReplace = uriReplace.replaceAll("\\\\", "/");
//
//			arguments.add("-output_uri_replace");
//			arguments.add("\"" + uriReplace + "\"");

			arguments.add("-document_type");
			arguments.add(sourceOptions.getDataFormat());
			
			addOtherArguments(arguments, sourceOptions.getOtherOptions());
			return arguments;
		}

        private void addOtherArguments(List<String> arguments,
                String otherOptions) throws JSONException {
            JSONArray jsonArray = new JSONArray(otherOptions);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject jsonObject = jsonArray.getJSONObject(i);
                @SuppressWarnings("rawtypes")
                Iterator keysIterator = jsonObject.keys();
                while(keysIterator.hasNext()) {
                    String key = (String)keysIterator.next();
                    arguments.add(key);
                    arguments.add(jsonObject.getString(key));
                }
                
            }
            
        }
	}

	public static class SourceOptions {
		private String entityName;
		private String flowName;
		private String flowType;
		private String dataFormat = "json";
		private String inputFileType;
		private String otherOptions;

		public SourceOptions(String entityName, String flowName, String flowType, Format dataFormat) {
			this.entityName = entityName;
			this.flowName = flowName;
			this.flowType = flowType;

			if (dataFormat.equals(Format.XML)) {
				this.dataFormat = "xml";
			} else if (dataFormat.equals(Format.JSON)) {
				this.dataFormat = "json";
			}
		}

		public String getEntityName() {
			return entityName;
		}

		public String getFlowName() {
			return flowName;
		}

		public String getFlowType() {
			return flowType;
		}

		public String getDataFormat() {
			return dataFormat;
		}

		public String getInputFileType() {
			return inputFileType;
		}

		public void setInputFileType(String inputFileType) {
			this.inputFileType = inputFileType;
		}
		
		public String getOtherOptions() {
            return otherOptions;
        }

        public void setOtherOptions(String otherOptions) {
            this.otherOptions = otherOptions;
        }
	}
}
