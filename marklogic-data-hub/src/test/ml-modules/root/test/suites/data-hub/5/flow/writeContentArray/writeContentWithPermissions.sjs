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

const flowUtils = require("/data-hub/5/impl/flow-utils.sjs");
const hubTest = require("/test/data-hub-test-helper.sjs");
const test = require("/test/test-helper.xqy");

const assertions = hubTest.runWithRolesAndPrivileges(['data-hub-developer'], [],
    function() {
      const contentWithPermissions = {
        uri: "/a.json", 
        value: {"a":true}, 
        context: {
          permissions: [xdmp.permission("data-hub-common", "read"), xdmp.permission("data-hub-common", "update")]
        }
      };
      flowUtils.writeContentArray([contentWithPermissions]);

      const record = hubTest.getRecord("/a.json");
      const message = "Since the content has permissions, the user's default permissions (inherited from tde-admin) " + 
        "should not be included; record: " + xdmp.toJsonString(record);
      return [
        test.assertEqual("read", record.permissions["data-hub-common"][0], message),
        test.assertEqual("update", record.permissions["data-hub-common"][1], message),
        test.assertEqual(1, Object.keys(record.permissions).length, message)
      ];
    }
);

assertions 