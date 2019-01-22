#!/bin/bash

./mlcp.sh import -mode "local" -host "{YOUR HOST}" -port "{STAGING_PORT}" -username "{USERNAME}" -password "{PASSWORD}" -input_file_path "{INPUT_FILE_PATH}" -input_file_type "documents" -output_collections "Product,json,input" -output_permissions "rest-reader,read,rest-writer,update" -output_uri_replace "{INPUT_FILE_PATH},'/json/sjs'" -document_type "json" -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" -transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" -transform_param "entity-name=Product,flow-name=ProductIpFlowJS" -restrict_hosts true

./mlcp.sh import -mode "local" -host "YOUR HOST" -port "STAGING_PORT" -username "USERNAME" -password "PASSWORD" -input_file_path "INPUT_FILE_PATH" -input_file_type "documents" -output_collections "Product,json,input" -output_permissions "rest-reader,read,rest-writer,update" -output_uri_replace "INPUT_FILE_PATH,'/json/xqy'" -document_type "json" -transform_module "/data-hub/4/transforms/mlcp-flow-transform.xqy" -transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" -transform_param "entity-name=Product,flow-name=ProductIpFlowJX" -restrict_hosts true




./mlcp.sh import -mode "local" -host "YOUR HOST" -port "STAGING_PORT" -username "USERNAME" -password "PASSWORD" -input_file_path "INPUT_FILE_PATH" -input_file_type "documents" -output_collections "Product,xml,input" -output_permissions "rest-reader,read,rest-writer,update" -output_uri_replace "INPUT_FILE_PATH,'/xml/sjs'" -document_type "xml" -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" -transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" -transform_param "entity-name=Product,flow-name=ProductIpFlowXS" -restrict_hosts true

./mlcp.sh import -mode "local" -host "YOUR HOST" -port "STAGING_PORT" -username "USERNAME" -password "PASSWORD" -input_file_path "INPUT_FILE_PATH" -input_file_type "documents" -output_collections "Product,xml,input" -output_permissions "rest-reader,read,rest-writer,update" -output_uri_replace "INPUT_FILE_PATH,'/xml/xqy'" -document_type "xml" -transform_module "/data-hub/4/transforms/mlcp-flow-transform.xqy" -transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" -transform_param "entity-name=Product,flow-name=ProductIpFlowXX" -restrict_hosts true
