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

import DocPermission from "./doc-permissions.mjs";
import Mapping from './mapping.mjs';
import ProtectedCollections from './protected-collections.mjs';
import Provenance from './provenance.mjs';
import Temporal from './temporal.mjs';

import httpUtils from '/data-hub/5/impl/http-utils.mjs';

// define constants for caching expensive operations
const cachedFeatures = {};
const registeredFeatures = {
    docPermission: DocPermission,
    mapping: Mapping,
    protectedCollections: ProtectedCollections,
    provenance: Provenance,
    temporal: Temporal
};




function getFeatures() {
    return registeredFeatures;
}


export default {
    getFeatures
};
