(:
  Copyright 2012-2016 MarkLogic Corporation

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

module namespace es-wrapper = "http://marklogic.com/data-hub/es-wrapper";

declare option xdmp:mapping "false";

(:
 : NOTE to reader: This entire module exists so that we can have 1
 : codebase that works on ML9 and ML8. We are purposely wrapping ES
 : calls in evals so that this code can be safely deployed on ML8
 : w/o causing an error in the static type check phase.
 : If we drop ML8 support this wrapper lib can go away
 :)
declare function es-wrapper:search-options-generate($model)
{
  xdmp:eval('
    import module namespace es = "http://marklogic.com/entity-services"
      at "/MarkLogic/entity-services/entity-services.xqy";

    declare variable $model external;

    es:search-options-generate($model)
  ',
  map:entry("model", $model))
};

declare function es-wrapper:database-properties-generate($model)
{
  xdmp:eval('
    import module namespace es = "http://marklogic.com/entity-services"
      at "/MarkLogic/entity-services/entity-services.xqy";

    declare variable $model external;

    es:database-properties-generate($model)
  ',
  map:entry("model", $model))
};

declare function es-wrapper:resolve-datatype($model, $entity-type-name, $property-name)
{
  xdmp:eval('
    import module namespace esi = "http://marklogic.com/entity-services-impl"
      at "/MarkLogic/entity-services/entity-services-impl.xqy";

    declare variable $model external;
    declare variable $entity-type-name external;
    declare variable $property-name external;

    esi:resolve-datatype($model, $entity-type-name, $property-name)
  ',
  map:new((
    map:entry("model", $model),
    map:entry("entity-type-name", $entity-type-name),
    map:entry("property-name", $property-name)
  )))
};

declare function es-wrapper:indexable-datatype($datatype)
{
  xdmp:eval('
    import module namespace esi = "http://marklogic.com/entity-services-impl"
      at "/MarkLogic/entity-services/entity-services-impl.xqy";

    declare variable $datatype external;
    esi:indexable-datatype($datatype)
  ',
  map:entry("datatype", $datatype))
};


