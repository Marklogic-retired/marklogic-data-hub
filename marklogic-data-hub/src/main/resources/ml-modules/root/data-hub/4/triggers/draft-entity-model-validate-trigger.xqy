xquery version '1.0-ml';

import module namespace entityTrigger = "http://marklogic.com/data-hub/entity-trigger"
at "./entity-model-validate-trigger-lib.xqy";
import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';

declare variable $trgr:uri as xs:string external;

entityTrigger:entity-validate($trgr:uri, fn:true())