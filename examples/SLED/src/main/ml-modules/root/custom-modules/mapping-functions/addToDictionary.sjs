'use strict';
declareUpdate();

const config = require('/com.marklogic.hub/config.sjs')

function addToDictionary(text,dictionaryname){
  let dictionaryuri = '/customDictionary/' + dictionaryname + '.json'
  xdmp.invokeFunction(() => updateDict(text, dictionaryuri ),{database: xdmp.database(config.FINALDATABASE)})
  return text
}

function updateDict(text,dictionaryuri){
  declareUpdate();
  var spell = require("/MarkLogic/spell");
  text = fn.string(text);
  spell.addWord( dictionaryuri, text)
}

module.exports = {
  addToDictionary
}
