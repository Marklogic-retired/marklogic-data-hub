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

const mjsModules = {};

function requireMjsModule(modulePath) {
  return requireMjsModules(modulePath)[0];
}
function requireMjsModules(...modulePaths) {
  const cleanModulePaths = modulePaths.map(mp => mp.replace(/"/g, ""));
  return fn.head(evalModule(`'use strict';
    ${cleanModulePaths.map((mp, i) => `import mjsMod${i} from "${mp}";`).join("\n")}
[${cleanModulePaths.map((mp, i) => `mjsMod${i}`).join(", ")}];`));
}

exports.requireMjsModule = requireMjsModule;
exports.requireMjsModules = requireMjsModules;