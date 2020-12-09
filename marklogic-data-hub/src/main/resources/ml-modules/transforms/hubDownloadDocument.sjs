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

/**
 * Data Hub REST transform used when downloading a document. Only purpose so far is to pretty-print a JSON object or
 * array.
 */
function transform(context, params, content) {
  // See https://docs.marklogic.com/Node.nodeType
  const isJsonArrayOrObject = content != null && (17 === content.root.nodeType || 18 === content.root.nodeType);
  const isXml = content != null && 1 === content.root.nodeType;
  const prettyXmlOptions = {indentUntyped: 'yes', omitXmlDeclaration: 'no'};

  if(isJsonArrayOrObject) {
    return JSON.stringify(content.toObject(), null, 2);
  } else if(isXml) {
    return xdmp.quote(content, prettyXmlOptions);
  } else {
    return content;
  }
}

exports.transform = transform;
