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
package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.MasteringManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MasteringManagerImpl implements MasteringManager {
    @Autowired
    protected HubConfig hubConfig;

    @Autowired
    protected HubProject hubProject;

    protected DatabaseClient srcClient = null;

    protected MergeResource mergeResource = null;

    @Override
    public UnmergeResponse unmerge(String mergeURI, Boolean retainAuditTrail, Boolean blockFutureMerges) {
        return getMergeResource().unmerge(mergeURI, retainAuditTrail, blockFutureMerges);
    }

    @Override
    public MergeResponse merge(List<String> mergeURIs, String flowName, String stepNumber, Boolean preview, JsonNode options) {
        return getMergeResource().merge(mergeURIs, flowName, stepNumber, preview, options);
    }

    private MergeResource getMergeResource() {
        if (mergeResource == null) {
            mergeResource = new MergeResource(getSrcClient(), hubConfig.getDbName(DatabaseKind.FINAL));
        }
        return mergeResource;
    }

    private DatabaseClient getSrcClient() {
        if (srcClient == null) {
            srcClient = hubConfig.newStagingClient();
        }
        return srcClient;
    }

    static class MergeResource extends ResourceManager {
        private String targetDatabase;

        public MergeResource(DatabaseClient srcClient, String targetDatabase) {
            super();
            this.targetDatabase = targetDatabase;
            srcClient.init("ml:smMerge" , this);
        }

        public UnmergeResponse unmerge(String mergeURI, Boolean retainAuditTrail, Boolean blockFutureMerges) {
            UnmergeResponse resp;

            RequestParameters params = new RequestParameters();
            params.add("mergeURI", mergeURI);
            params.put("retainAuditTrail", retainAuditTrail.toString());
            params.put("blockFutureMerges", blockFutureMerges.toString());
            params.put("targetDatabase", targetDatabase);
            params.put("sourceDatabase", targetDatabase);
            ResourceServices.ServiceResultIterator resultItr = this.getServices().delete(params, null);
            try {
                if (resultItr == null || !resultItr.hasNext()) {
                    resp = null;
                } else {
                    ResourceServices.ServiceResult res = resultItr.next();
                    StringHandle handle = new StringHandle();
                    ObjectMapper objectMapper = new ObjectMapper();
                    resp = objectMapper.readValue(res.getContent(handle).get(), UnmergeResponse.class);
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                if (resultItr != null) {
                    resultItr.close();
                }
            }
            return resp;
        }

        public MergeResponse merge(List<String> mergeURIs, String flowName, String stepNumber, Boolean preview, JsonNode options) {
            MergeResponse resp;

            RequestParameters params = new RequestParameters();
            params.put("uri", mergeURIs);
            params.put("preview", preview.toString());
            params.put("flowName", flowName);
            params.put("step", stepNumber);
            params.put("targetDatabase", targetDatabase);
            params.put("sourceDatabase", targetDatabase);
            JacksonHandle jsonOptions = new JacksonHandle().with(options);
            ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, jsonOptions);
            try {
                if (resultItr == null || !resultItr.hasNext()) {
                    resp = null;
                } else {
                    ResourceServices.ServiceResult res = resultItr.next();
                    StringHandle handle = new StringHandle();
                    ObjectMapper objectMapper = new ObjectMapper();
                    resp = objectMapper.readValue(res.getContent(handle).get(), MergeResponse.class);
                }
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                if (resultItr != null) {
                    resultItr.close();
                }
            }
            return resp;
        }
    }
}
