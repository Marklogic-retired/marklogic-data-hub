#!/bin/sh
mlcp.sh import -input_file_path ./input/orders/orders.csv -input_file_type delimited_text -document_type json -transform_module /data-hub/5/transforms/mlcp-flow-transform.sjs -transform_param "options={},flow-name=LoadOrders" -host localhost -port 8010 -username admin -password admin -output_collections step -output_uri_suffix .json -generate_uri true
