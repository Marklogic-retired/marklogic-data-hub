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

const spell = require("/MarkLogic/spell");

function main(content, options) {

  const values = cts.values(cts.pathReference("/(es:envelope|envelope)/(es:instance|instance)/Person/fname", [], {es: "http://marklogic.com/entity-services"})).toArray();

  const dictionary = spell.makeDictionary(values, "element");
  const uri = "/dictionary/first-names.xml";

  console.log("Generating dictionary of " + values.length + " first names at URI: " + uri);

  xdmp.invokeFunction(() => xdmp.documentInsert(uri, dictionary, [
    xdmp.permission("data-hub-common", "read"),
    xdmp.permission("data-hub-common-writer", "update")],
  ["mdm-dictionary"]), {update: "true"});

  return null;
}

module.exports = {
  main: main
};
