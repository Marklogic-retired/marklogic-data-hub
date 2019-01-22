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

import com.marklogic.client.datamovement.WriteEvent;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.marker.AbstractWriteHandle;
import com.marklogic.client.io.marker.DocumentMetadataWriteHandle;
import com.marklogic.client.io.marker.JSONWriteHandle;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/*
 * Singleton to aid with Entity deployment. Needed as bridge between walking the entities file structure
 * on modules deploy and inserting entity JSON models in the database after triggers are created.
 */
public class EntityDeploymentUtil {
	private ConcurrentHashMap<String, DocumentMetadataHandle> metaMap = new ConcurrentHashMap<String, DocumentMetadataHandle>();
	private ConcurrentHashMap<String, JSONWriteHandle> contentMap = new ConcurrentHashMap<String, JSONWriteHandle>();

	private static EntityDeploymentUtil instance;
    
    public static synchronized EntityDeploymentUtil getInstance() {
        if(instance == null){
            instance = new EntityDeploymentUtil();
        }
        return instance;
    }

    public Set<String> getEntityURIs() {
        return contentMap.keySet();
	}
	
	public void enqueueEntity(String uri, DocumentMetadataHandle meta, JSONWriteHandle content) {
        metaMap.put(uri, meta);
		contentMap.put(uri, content);
	}

	public WriteEvent dequeueEntity(String uri) {
		DocumentMetadataHandle meta = metaMap.get(uri);
		JSONWriteHandle content = contentMap.get(uri);
		return new WriteEventImpl(uri, meta, content);
	}
	
	public void reset() {
		metaMap.clear();
		contentMap.clear();
	}
	
	private class WriteEventImpl implements WriteEvent {
		private String uri;
		private DocumentMetadataHandle meta;
		private JSONWriteHandle content;

		public WriteEventImpl(String uri, DocumentMetadataHandle meta, JSONWriteHandle content) {
			this.uri = uri;
			this.meta = meta;
			this.content = content;
		}

		@Override
		public String getTargetUri() {
			return uri;
		}

		@Override
		public AbstractWriteHandle getContent() {
			return content;
		}

		@Override
		public DocumentMetadataWriteHandle getMetadata() {
			return meta;
		}

		@Override
		public long getJobRecordNumber() {
			return 0;
		}

		@Override
		public long getBatchRecordNumber() {
			return 0;
		}		
	}
	
}
