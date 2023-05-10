/**
 Copyright (c) 2021 MarkLogic Corporation

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
'use strict';
import config from "/com.marklogic.hub/config.mjs";
import consts from "/data-hub/5/impl/consts.mjs";
import httpUtils from "/data-hub/5/impl/http-utils.mjs";
import hubUtils from "/data-hub/5/impl/hub-utils.mjs";
import entityLib from "/data-hub/5/impl/entity-lib.mjs";

xdmp.securityAssert("http://marklogic.com/data-hub/privileges/write-entity-model", "execute");

const models = fn.head(xdmp.fromJSON(external.models));

const databases = [config.STAGINGDATABASE, config.FINALDATABASE];

databases.forEach((database) => {
  xdmp.invokeFunction(() => {
    models.forEach(model => {
      const name = model.info.title;
      if (name == null) {
        httpUtils.throwBadRequest("The model must have an info object with a title property");
      }
      entityLib.writeModelToDatabases(name, model, [database]);
    });
  }, {database: xdmp.database(database), commit: "auto", update: "true"});
});
// wait on post-commit triggers
let tasksFinished = false;
let taskCheckCount = 0;
do {
  const requestStatusCounts = xdmp.hosts().toArray()
    .map((host) => { return {host, taskServerId: fn.head(xdmp.hostStatus(host)).taskServer.taskServerId}; })
    .map((taskServerInfo) => {
      return fn.head(xdmp.serverStatus(taskServerInfo.host, taskServerInfo.taskServerId)).toObject()
        .requestStatuses.filter((requestStatus) => requestStatus.requestText === "/data-hub/4/triggers/entity-model-trigger.xqy").length;
    });
  tasksFinished = fn.sum(Sequence.from(requestStatusCounts)) === 0;
  if (!tasksFinished) {
    xdmp.sleep(50);
  }
  taskCheckCount++;
} while (!tasksFinished && taskCheckCount < 100);
xdmp.trace(consts.TRACE_ENTITY, "Finished saving models");

