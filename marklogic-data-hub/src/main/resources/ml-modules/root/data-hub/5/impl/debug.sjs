/**
  Copyright 2012-2019 MarkLogic Corporation

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

export class Debug {
    constructor(config) {
      this.logLevel   = config && config.logLevel || 'default';
      this.logLevels  = ['default','notice','trace','info'];
      this.logTypes   = ['error','warning','notice','trace','info'];
    }
  
    _addMetadata(payload) {
      if (payload) {
        payload.currentDateTime = fn.currentDateTime();
        payload.user = xdmp.getCurrentUser();
        payload.serverID = xdmp.server();
        payload.serverName = xdmp.serverName(payload.serverID);
        payload.dbID = xdmp.database();
        payload.dbName = xdmp.databaseName(payload.dbID);
        payload.modulesDbID = xdmp.modulesDatabase();
        payload.modulesDbName = xdmp.databaseName(payload.modulesDbID);
      }
      return payload;
    }

    _canLog(payload) {
      let logLevel = this.logLevel;
      let typeCheck = {
        'error': function () {
          return ['default','notice','trace','info'].includes(logLevel);
        },
        'warning': function () {
          return ['default','notice','trace','info'].includes(logLevel);
        },
        'notice': function () {
          return ['notice','trace','info'].includes(logLevel);
        },
        'trace': function () {
          return ['trace','info'].includes(logLevel);
        },
        'info': function () {
          return ['info'].includes(logLevel);
        }
      };
      return payload.type ? typeCheck[payload.type] && typeCheck[payload.type]() : false;
    }
  
    _log(payload) {
      payload = this._addMetadata(payload);
      xdmp.log(JSON.stringify(payload));  // logging complete JSON
      return payload;
    }
  
    log(payload) {
      return (this._canLog(payload)) ? 
        this._log(payload) : 
        new Error('Log level "' + this.logLevel + '" does not have permission to log type: "' + payload.type + '"' || '[unknown]');
      
//      when eventually logging to the database, we
//      should return a Promise to be resolved after 
//      payload has been saved to DB.
      
//      return new Promise((resolve, reject) => {
//        resolve(payload);
//      })
    }
}