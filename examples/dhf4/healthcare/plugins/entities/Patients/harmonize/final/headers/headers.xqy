xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare namespace es = "http://marklogic.com/entity-services";

declare namespace hl7 = "urn:hl7-org:v3";

declare option xdmp:mapping "false";

(:~
 : Create Headers Plugin
 :
 : @param $id      - the identifier returned by the collector
 : @param $content - the output of your content plugin
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - zero or more header nodes
 :)
declare function plugin:create-headers(
  $id as xs:string,
  $content as item()?,
  $options as map:map) as node()*
{
  (
    <original-hl7>{$id}</original-hl7>,
    <patient-ssn>{$content/hl7:recordTarget/hl7:patientRole/hl7:id/@extension/fn:data()}</patient-ssn>,
    <patient-gender>
    {
      let $gender-code as xs:string? := $content/hl7:recordTarget/hl7:patientRole/hl7:patient/hl7:administrativeGenderCode/@code
      return
        if ($gender-code = "F") then "female"
        else if ($gender-code = "M") then "male"
        else "unknown"
    }
    </patient-gender>,
    <birth-date>
    {
      let $bd as xs:string? := $content/hl7:recordTarget/hl7:patientRole/hl7:patient/hl7:birthTime/@value
      return
        if ($bd) then
          xs:date(fn:replace($bd, "(\d\d\d\d)(\d\d)(\d\d)", "$1-$2-$3"))
        else ()
    }
    </birth-date>,
    <race>{$content/hl7:recordTarget/hl7:patientRole/hl7:patient/hl7:raceCode/@displayName/fn:data()}</race>,

    <providers>
    {
      for $npi as xs:string in $content//hl7:id[@root="2.16.840.1.113883.4.6"]/@extension
      let $provider := fn:collection("nppes")/es:envelope/es:content/root[NPI = $npi]
      return
        <provider>
          <npi>{$npi}</npi>
          <provider-name>
          {
            fn:string-join((
              $provider/Provider_First_Name,
              $provider/Provider_Last_Name__Legal_Name_
            ), " ")
          }
          </provider-name>
        </provider>
    }
    </providers>
  )
};
