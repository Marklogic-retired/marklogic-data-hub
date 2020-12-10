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

const test = require("/test/test-helper.xqy");
const hent = require("/data-hub/5/impl/hub-entities.xqy");

function checkForTde(uri){
  return fn.head(xdmp.eval(
    `fn.docAvailable('${uri}') `,
    {uri:uri}, {database: xdmp.schemaDatabase()}
  ));
}

function verifyTdeGeneration() {
  return [
    test.assertTrue(checkForTde("/tde/Entity1-0.0.1.tdex"), "TDE should be generated when 'tdeGenerationDisabled' is set to false"),
    test.assertFalse(checkForTde("/tde/Entity2-0.0.1.tdex"), "TDE should not be generated when 'tdeGenerationDisabled' is set to true"),
    test.assertFalse(checkForTde("/tde/Entity3-0.0.1.tdex"), "TDE should not be generated when value of 'tdeGenerationDisabled' is set to 'true' ")
  ];
}

function testIfTdeisEnabled(){
  let entity1 = {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/",
      "description": "A person entity"
    },
    "definitions": {
      "Customer": {
        "tdeGenerationDisabled": "true"
      }
    }
  }
  let entity2 = {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/",
      "description": "A person entity"
    },
    "definitions": {
      "Customer": {
        "tdeGenerationDisabled": true
      }
    }
  }

  let entity3 = {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/",
      "description": "A person entity"
    },
    "definitions": {
      "Person": {
        "tdeGenerationDisabled": "randomValue"
      }
    }
  }

  let entity4 = {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/",
      "description": "A person entity"
    },
    "definitions": {
      "Person": {

      }
    }
  }
  let entity5 = {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/",
      "description": "A person entity"
    },
    "definitions": {
      "Customer": {
        "tdeGenerationDisabled": true
      },
      "Person":{

      }
    }
  }

  let entity6 = {
    "info": {
      "title": "Person",
      "version": "0.0.1",
      "baseUri": "http://marklogic.com/",
      "description": "A person entity"
    },
    "definitions": {
      "Person": {
        "tdeGenerationDisabled": false
      }
    }
  }
  return [
    test.assertFalse(hent.isTdeGenerationEnabled(entity1), "There's no entity with a name matching info/title, so we use 'Customer' " +
      "will return false since value of 'tdeGenerationDisabled' is 'true'"),
    test.assertFalse(hent.isTdeGenerationEnabled(entity2), "There's no entity with a name matching info/title, so we use'Customer' " +
      "will return false since value of 'tdeGenerationDisabled' true"),
    test.assertTrue(hent.isTdeGenerationEnabled(entity3), "The function should return true if value of 'tdeGenerationDisabled' is not true or 'true'"),
    test.assertTrue(hent.isTdeGenerationEnabled(entity4), "The function should return true if 'tdeGenerationDisabled' is not set"),
    test.assertTrue(hent.isTdeGenerationEnabled(entity5), "The 'tdeGenerationDisabled' should be present in primary entity type"),
    test.assertTrue(hent.isTdeGenerationEnabled(entity6), "The function would return true if 'tdeGenerationDisabled' is set to false"),
  ];

}

[].concat(verifyTdeGeneration())
  .concat(testIfTdeisEnabled())
