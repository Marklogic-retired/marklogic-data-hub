xquery version "1.0-ml";

module namespace sm-es = "http://marklogic.com/smart-mastering/entity-services";

import module namespace es-impl = "http://marklogic.com/smart-mastering/entity-services-impl" at "impl/sm-es-impl.xqy";

declare function sm-es:get-entity-descriptors()
  as array-node()
{
  es-impl:get-entity-descriptors()
};

declare function sm-es:get-entity-def($target-entity as item()?) as object-node()?
{
  es-impl:get-entity-def($target-entity)
};

declare function sm-es:get-entity-def-property(
  $entity-def as object-node()?,
  $property-title as xs:string?
) as object-node()?
{
  es-impl:get-entity-def-property($entity-def, $property-title)
};
