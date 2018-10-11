#!/bin/sh

# Input Flows

gradle hubCreateInputFlow -PentityName=Product -PflowName=ProductIpFlowJS -PdataFormat=json -PpluginFormat=sjs -PuseES=false
gradle hubCreateInputFlow -PentityName=Product -PflowName=ProductIpFlowJX -PdataFormat=json -PpluginFormat=xqy -PuseES=false
gradle hubCreateInputFlow -PentityName=Product -PflowName=ProductIpFlowXS -PdataFormat=xml -PpluginFormat=sjs -PuseES=false
gradle hubCreateInputFlow -PentityName=Product -PflowName=ProductIpFlowXX -PdataFormat=xml -PpluginFormat=xqy -PuseES=false

