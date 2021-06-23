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
Defines "core" mapping functions that are available as part of the DHF install.
The implementation is in a separate module so that the functions exposed to the mapper
can be tightly controlled by this module.
:)
module namespace dhmf = "http://marklogic.com/data-hub/mapping/functions";

import module namespace dhmf-impl = "http://marklogic.com/data-hub/mapping/functions/impl"
  at "/data-hub/5/mapping/core-functions-impl.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
 at "/MarkLogic/json/json.xqy";

declare function parseDate($value as xs:string?, $pattern as xs:string?) as xs:string?
{
  dhmf-impl:parseDate($value, $pattern)
};

declare function parseDateTime($value as xs:string?, $pattern as xs:string?) as xs:string?
{
  dhmf-impl:parseDateTime($value, $pattern)
};

(:~
 : @param $key the key to lookup in the document identified by dictionary-uri
 : @param $dictionary-uri the URI of a document containing a JSON object
 : @return the value associated with the key, if found; if dictionary-uri does not correspond to a document in the
 : database, then an error is thrown
:)
declare function documentLookup($key as item()?, $dictionary-uri as xs:string?) as item()?
{
  dhmf-impl:documentLookup($key, $dictionary-uri)
};

(:~
 : @param $key the key to lookup in the given dictionary
 : @param $dictionary a string containing a JSON object that defines keys and values
 : @return the value associated with the key, if found
 :)
declare function memoryLookup($key as item()?, $dictionary as xs:string?) as item()?
{
  dhmf-impl:memoryLookup($key, $dictionary)
};

(:~
 : @param $key the key to lookup in the given map object
 : @param $object the map object that defines key/value pairs
 : @return the value associated with the key, if found
 :)
declare function lookup($key as item()?, $object) as item()?
{
  (:
  Because this is just syntactic sugar on top of map:get (so that a non-technical user doesn't need to know about map:* functions),
  this is implemented within this module as opposed to the implementation module.
  :)
  map:get($object, $key)
};

declare function hubURI($entity-type as xs:string?) as xs:string?
{
  dhmf-impl:hubURI($entity-type)
};
