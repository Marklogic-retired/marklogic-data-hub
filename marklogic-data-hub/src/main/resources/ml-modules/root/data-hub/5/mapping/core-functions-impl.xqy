(:
  Copyright (c) 2021 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
:)
xquery version "1.0-ml";

(:
Implementations the functions defined in /data-hub/5/mapping-functions/core-functions.xqy.
:)

module namespace dhmf-impl = "http://marklogic.com/data-hub/mapping/functions/impl";

import module namespace httputils = "http://marklogic.com/data-hub/http-utils"
  at "/data-hub/5/impl/http-utils.xqy";

(:
The original SJS implementation had a concept of "non-standard" formats that involve the use of "Mon" instead of "MM".
:)
declare variable $NON-STANDARD-FORMATS := map:new((
  map:entry("Mon DD,YYYY", "^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ([0-9]|[0-2][0-9]|[3][0-1]),([0-9]{4})$"),
  map:entry("DD Mon YYYY", "^([0-9]|[0-2][0-9]|[3][0-1]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ([0-9]{4})$"),
  map:entry("DD-Mon-YYYY", "^([0-9]|[0-2][0-9]|[3][0-1])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-([0-9]{4})$")
));

(: Used in support of "non standard" date formats :)
declare variable $MONTH-MAP := map:new((
  map:entry("JAN", "01"),
  map:entry("FEB", "02"),
  map:entry("MAR", "03"),
  map:entry("APR", "04"),
  map:entry("MAY", "05"),
  map:entry("JUN", "06"),
  map:entry("JUL", "07"),
  map:entry("AUG", "08"),
  map:entry("SEP", "09"),
  map:entry("OCT", "10"),
  map:entry("NOV", "11"),
  map:entry("DEC", "12")
));

(: Avoids compiling a JSON string into a map multiple times in the same transaction :)
declare variable $MEMORY-LOOKUP-CACHE := map:map();

(: Avoids converting a JSON document into a map multiple times in the same transaction :)
declare variable $DOCUMENT-LOOKUP-CACHE := map:map();

declare function parseDate($value as xs:string?, $pattern as xs:string?) as xs:string?
{
  if (fn:not(fn:normalize-space($value)) or fn:not($value)) then ()
  else
    let $error-message := "The pattern '" || $pattern || "' cannot be applied to the value '" || $value || "'"
    let $pattern := fn:normalize-space(fn:replace($pattern, ", ", ","))
    let $value := fn:replace($value, ", ", ",")
    return try {
      if ($pattern = map:keys($NON-STANDARD-FORMATS)) then
        parse-non-standard-date($value, $pattern)
      else
        parse-standard-date($value, $pattern)
    } catch ($error) {
      httputils:throw-bad-request((), $error-message)
    }
};

declare function parseDateTime($value, $pattern as xs:string?) as xs:string?
{
  if (fn:not(fn:normalize-space($value)) or fn:not($value)) then ()
  else
    let $error-message := "The pattern '" || $pattern || "' cannot be applied to the value '" || $value || "'"
    let $pattern := fn:normalize-space($pattern)

    let $formats-with-misused-day-indicator := ("YYYYMMDDThhmmss", "DD/MM/YYYY-hh:mm:ss", "DD/MM/YYYY hh:mm:ss", "YYYY/MM/DD-hh:mm:ss" , "YYYY/MM/DD hh:mm:ss")
    let $pattern :=
      if ($pattern = $formats-with-misused-day-indicator) then fn:replace($pattern, "DD", "dd")
      else $pattern

    let $pattern := fn:replace($pattern, "YYYY", "yyyy")

    return try {
      fn:string(xdmp:parse-yymmdd($pattern, $value))
    } catch ($error) {
      httputils:throw-bad-request((), $error-message)
    }
};

declare function documentLookup($key as item()?, $dictionary-uri as xs:string?) as item()?
{
  if (fn:not(fn:doc-available($dictionary-uri))) then
    fn:error((), "Dictionary not found at '" || $dictionary-uri || "'")
  else
    let $map := map:get($DOCUMENT-LOOKUP-CACHE, $dictionary-uri)
    let $map :=
      if (fn:exists($map)) then $map
      else
        let $doc := fn:doc($dictionary-uri)
        let $_ :=
          if (xdmp:node-kind($doc/node()) != "object") then
            fn:error((), "Dictionary at '" || $dictionary-uri || "' is not a JSON Object")
          else ()

        let $map := xdmp:from-json($doc)
        let $_ := add-upper-case-entries($map)
        let $_ := map:put($DOCUMENT-LOOKUP-CACHE, $dictionary-uri, $map)
        return $map

    return map:get($map, fn:upper-case($key))
};

declare function memoryLookup($key as item()?, $dictionary as xs:string?) as item()?
{
  let $map := map:get($MEMORY-LOOKUP-CACHE, $dictionary)
  let $map :=
    if (fn:exists($map)) then $map
    else
      let $map := xdmp:from-json-string($dictionary)
      let $_ := add-upper-case-entries($map)
      let $_ := map:put($MEMORY-LOOKUP-CACHE, $dictionary, $map)
      return $map

  return map:get($map, fn:upper-case($key))
};

declare function hubURI($entity-type as xs:string?) as xs:string?
{
  if (fn:empty($entity-type) or fn:normalize-space($entity-type) = "") then
    httputils:throw-bad-request((), "Unable to generate URI; entity type should not be an empty string")
  else
    "/" || $entity-type || "/" || sem:uuid-string() || ".json"
};

(:
This is done to preserve case-insensitive lookups, though it's not yet clear if we should be doing that;
it's not documented at https://docs.marklogic.com/datahub/5.5/flows/dhf-mapping-functions.html . It blocks users
from having e.g. "d" and "D" dictionary entries, which would be useful for a dictionary that defines different types
of date format characters ("d" = day of month, "D" = day of year).
:)
declare private function add-upper-case-entries($map)
{
  for $key in map:keys($map)
  return map:put($map, fn:upper-case($key), map:get($map, $key))
};

declare private function parse-standard-date($value as xs:string?, $pattern as xs:string?) as xs:string?
{
  (:
  The original SJS impl had a notion of 'standard formats', which boiled down to allowing a user to improperly
  use 'DD' instead of 'dd'. We still need to support that for the given formats below.
  :)
  let $pattern :=
    if ($pattern = ("MM/DD/YYYY", "DD/MM/YYYY", "MM-DD-YYYY", "MM.DD.YYYY", "DD.MM.YYYY", "YYYYMMDD", "YYYY/MM/DD")) then
      fn:replace($pattern, "DD", "dd")
    else $pattern

  let $picture := fn:tokenize(fn:replace($pattern, "YYYY", "yyyy"), "T")[1]
  return fn:substring(fn:string(xdmp:parse-yymmdd($picture, $value)), 1, 10)
};

declare private function parse-non-standard-date($value as xs:string?, $pattern as xs:string?) as xs:string?
{
  let $date-pattern := map:get($NON-STANDARD-FORMATS, $pattern)
  where $date-pattern and fn:matches($value, $date-pattern, "i")
  return
    if ($pattern = "Mon DD,YYYY") then
      let $month := map:get($MONTH-MAP, fn:upper-case(fn:substring($value, 1, 3)))
      let $day := fn:substring($value, 5, 2)
      let $year := fn:substring($value, 8, 4)
      return fn:string-join(($year, $month, $day), "-")
    else
      let $month := map:get($MONTH-MAP, fn:upper-case(fn:substring($value, 4, 3)))
      let $day := fn:substring($value, 1, 2)
      let $year := fn:substring($value, 8, 4)
      return fn:string-join(($year, $month, $day), "-")
};
