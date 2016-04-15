xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace envelope = "http://marklogic.com/data-hub/envelope";

declare namespace hl7 = "urn:hl7-org:v3";

declare option xdmp:mapping "false";

(:~
 : Create Headers Plugin
 :
 : @param id       - the identifier returned by the collector
 : @param content  - your final content
 : @param headers  - a sequence of header nodes
 : @param triples  - a sequence of triples
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - zero or more header nodes
 :)
declare function plugin:create-headers(
  $id as xs:string,
  $content as node()?,
  $options as map:map) as node()*
{
  (
    <patient-ssn>{$content/hl7:recordTarget/hl7:patientRole/hl7:id/@extension/fn:data()}</patient-ssn>,
    <patient-gender>
    {
      let $gender-code as xs:string? := $content/hl7:recordTarget/hl7:patientRole/hl7:patient/hl7:administrativeGenderCode/@code
      return
        if ($gender-code = "F") then "female"
        else if ($gender-code = "M") then "male"
        else "unknown"
    }
    </patient-gender>
  )
};
