#!/bin/bash

gradle hubRunFlow -PentityName=Product -PflowName=ProductHmFlowJS -PbatchSize=100 -PthreadCount=4 -PsourceDB=data-hub-STAGING -PdestDB=data-hub-FINAL

gradle hubRunFlow -PentityName=Product -PflowName=ProductHmFlowJX -PbatchSize=100 -PthreadCount=4 -PsourceDB=data-hub-STAGING -PdestDB=data-hub-FINAL

gradle hubRunFlow -PentityName=Product -PflowName=ProductHmFlowXS -PbatchSize=100 -PthreadCount=4 -PsourceDB=data-hub-STAGING -PdestDB=data-hub-FINAL

gradle hubRunFlow -PentityName=Product -PflowName=ProductHmFlowXX -PbatchSize=100 -PthreadCount=4 -PsourceDB=data-hub-STAGING -PdestDB=data-hub-FINAL

gradle hubRunFlow -PentityName=Product -PflowName=ProductHmFlowJSM -PbatchSize=100 -PthreadCount=4 -PsourceDB=data-hub-STAGING -PdestDB=data-hub-FINAL

gradle hubRunFlow -PentityName=Product -PflowName=ProductHmFlowJXM -PbatchSize=100 -PthreadCount=4 -PsourceDB=data-hub-STAGING -PdestDB=data-hub-FINAL
