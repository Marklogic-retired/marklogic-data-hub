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
 * Because DH app servers are still using the REST API error handler, errors should be communicated using the
 * "RESTAPI-SRVEXERR" status code. This ensures that the provided error message can be easily communicated to a client.
 *
 * @param message
 */
function throwBadRequest(message) {
  fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([400, message]));
}

function throwBadRequestWithArray(args){
  fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([400].concat(args)));
}

function throwForbidden(message) {
  fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([403, message]));
}

function throwNotFound(message) {
  fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([404, message]));
}

function throwNotFoundWithArray(args){
  fn.error(null, 'RESTAPI-SRVEXERR', Sequence.from([404].concat(args)));
}

module.exports = {
  throwBadRequest,
  throwBadRequestWithArray,
  throwForbidden,
  throwNotFound,
  throwNotFoundWithArray
};
