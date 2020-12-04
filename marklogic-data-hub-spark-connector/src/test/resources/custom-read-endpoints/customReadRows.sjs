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

var endpointState = fn.head(xdmp.fromJSON(endpointState));

const results = [endpointState];

/**
 * This endpoint simply says - if hasRunOnce doesn't equal true in endpointState, then add "testRow" to the results and
 * return it. Otherwise, only return the endpointState, which tells HubInputPartitionReader that there are no more rows
 * to read.
 */
if (true != endpointState.hasRunOnce) {
  results.push(endpointState.testRow);
  endpointState.hasRunOnce = true;
}

Sequence.from(results);
