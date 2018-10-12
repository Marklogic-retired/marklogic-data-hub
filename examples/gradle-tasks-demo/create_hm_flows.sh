#!/bin/bash

# Harmonization Flows without mapping

gradle hubCreateHarmonizeFlow -PentityName=Product -PflowName=ProductHmFlowJS -PdataFormat=json -PpluginFormat=sjs -PuseES=true
gradle hubCreateHarmonizeFlow -PentityName=Product -PflowName=ProductHmFlowJX -PdataFormat=json -PpluginFormat=xqy -PuseES=true
gradle hubCreateHarmonizeFlow -PentityName=Product -PflowName=ProductHmFlowXS -PdataFormat=xml -PpluginFormat=sjs -PuseES=true
gradle hubCreateHarmonizeFlow -PentityName=Product -PflowName=ProductHmFlowXX -PdataFormat=xml -PpluginFormat=xqy -PuseES=true

# Harmonization Flows with mapping
gradle hubCreateHarmonizeFlow -PentityName=Product -PflowName=ProductHmFlowJSM -PdataFormat=json -PpluginFormat=sjs -PuseES=true -PmappingName=prodMap-2
gradle hubCreateHarmonizeFlow -PentityName=Product -PflowName=ProductHmFlowJXM -PdataFormat=json -PpluginFormat=xqy -PuseES=true -PmappingName=prodMap-2
