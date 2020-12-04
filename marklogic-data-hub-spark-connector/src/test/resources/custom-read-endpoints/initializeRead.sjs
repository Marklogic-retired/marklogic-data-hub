/**
 Copyright (c) 2020 MarkLogic Corporation

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

/**
 * This custom endpoint simply returns a static schema and partitions array. The parameterizedPlan is empty because
 * our custom readRows endpoint doesn't need it, since it also is returning static data.
 */

const response = {
  "sparkSchema": {
    "type": "struct",
    "fields": [{
      "name": "myName",
      "type": "string",
      "nullable": false,
      "metadata": {}
    }, {
      "name": "myId",
      "type": "integer",
      "nullable": false,
      "metadata": {}
    },]
  },
  "partitions": [{
    "min": 0,
    "max": "18446744073709551615",
    "rowCount": 10,
    "batchCount": 1,
    "partitionBatchSize": "18446744073709551615"
  }],
  "parameterizedPlan": {}
};

response

