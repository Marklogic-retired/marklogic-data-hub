xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace es = "http://marklogic.com/entity-services";

declare option xdmp:mapping "false";

declare function plugin:write(
  $id as xs:string,
  $envelope as item(),
  $options as map:map) as empty-sequence()
{
	let $uri := "Claim1.xml"
	let $_ := xdmp:log("In writer")
	let $_ := xdmp:log($envelope)
	return
	  try{
	  		xdmp:document-insert(
	  				$uri,
	  				$envelope,
                    (xdmp:permission("data-hub-common", "read"),
                     xdmp:permission("data-hub-common", "update")),
	  				("Employee","claim") )
	  	 }
	  catch($exception)
	    {
	          xdmp:log(concat($id," is a duplicate document in this batch.") )
	        (:xdmp:log(fn:normalize-space(xdmp:quote($exception/error:format-string/text()))) :)
	    }
};
