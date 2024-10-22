/*
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

// No privilege required: Just appends strings to an entity type to form collection names

const entityType = external.entityType;

import masteringStepLib from "/data-hub/5/builtins/steps/mastering/default/lib.mjs";

let res = masteringStepLib.expectedCollectionEvents(entityType);

res;
